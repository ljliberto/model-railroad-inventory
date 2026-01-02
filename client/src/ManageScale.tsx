import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";


const GET_SCALES_FULL = gql`
  query GetScalesFull {
    scales {
      scale
      description
    }
  }
`;

const UPSERT_SCALE = gql`
  mutation UpsertScale($input: ScaleInput!) {
    upsertScale(input: $input) {
      scale
      description
    }
  }
`;

const DELETE_SCALE = gql`
  mutation DeleteScale($scale: String!) {
    deleteScale(scale: $scale)
  }
`;

interface ManageScaleProps {
  onScalesChanged?: () => void;
}

const ManageScale: React.FC<ManageScaleProps> = ({ onScalesChanged }) => {
  const { data, loading, error, refetch } = useQuery(GET_SCALES_FULL);
  const [upsertScale] = useMutation(UPSERT_SCALE, {
    refetchQueries: [
      { query: gql`query UniqueScales { uniqueScales }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });
  const [deleteScale] = useMutation(DELETE_SCALE, {
    refetchQueries: [
      { query: gql`query UniqueScales { uniqueScales }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ scale: "", description: "", oldScale: "" });

  const handleEdit = (scale: string) => {
    const found = data?.scales?.find((s: any) => s.scale === scale);
    setEditing(scale);
    setForm({ scale, description: found?.description || "", oldScale: scale });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await upsertScale({ variables: { input: { scale: form.scale, description: form.description, oldScale: form.oldScale } } });
    setEditing(null);
    setForm({ scale: "", description: "", oldScale: "" });
    await refetch();
    if (onScalesChanged) onScalesChanged();
  };

  const handleDelete = async (scale: string) => {
    if (!window.confirm(`Delete scale ${scale}?`)) return;
    try {
      await deleteScale({ variables: { scale } });
      await refetch();
      if (onScalesChanged) onScalesChanged();
    } catch (error: any) {
      alert(error.message || "Failed to delete scale");
    }
  };

  const handleInsert = async () => {
    await upsertScale({ variables: { input: { scale: form.scale, description: form.description } } });
    setForm({ scale: "", description: "", oldScale: "" });
    await refetch();
    if (onScalesChanged) onScalesChanged();
  };

  return (
    <section className="scale-manager">
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingTop: 8, paddingBottom: 16, marginBottom: -1 }}>
        <h2 style={{ margin: 0, paddingBottom: 16 }}>Manage Scales</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error loading scales</p>}
      </div>
      <table>
        <thead style={{ position: 'sticky', top: 'calc(8px + 2em + 32px)', background: '#fff', zIndex: 9, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <tr>
            <th>Scale</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.scales?.map((s: any) => (
            (!editing || editing === s.scale) && (
              <tr key={s.scale}>
                <td>{editing === s.scale ? <input name="scale" value={form.scale} onChange={handleChange} /> : s.scale}</td>
                <td>{editing === s.scale ? <input name="description" value={form.description} onChange={handleChange} /> : (s.description || "")}</td>
                <td>
                  {editing === s.scale ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <span style={{ display: 'inline-block', width: 16 }} />
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(s.scale)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginRight: 8 }}>
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button onClick={() => handleDelete(s.scale)} className="danger" title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
                        <span role="img" aria-label="delete">🗑️</span>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          ))}
          {!editing && (
            <tr>
              <td><input name="scale" value={form.scale} onChange={handleChange} /></td>
              <td><input name="description" value={form.description} onChange={handleChange} /></td>
              <td><button onClick={handleInsert}>Insert</button></td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ManageScale;
