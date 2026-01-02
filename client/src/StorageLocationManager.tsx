import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";


const GET_STORAGE_LOCATIONS_FULL = gql`
  query GetStorageLocationsFull {
    storageLocations {
      name
      description
    }
  }
`;

const UPSERT_STORAGE_LOCATION = gql`
  mutation UpsertStorageLocation($input: StorageLocationInput!) {
    upsertStorageLocation(input: $input) {
      name
      description
    }
  }
`;

const DELETE_STORAGE_LOCATION = gql`
  mutation DeleteStorageLocation($name: String!) {
    deleteStorageLocation(name: $name)
  }
`;


const StorageLocationManager: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_STORAGE_LOCATIONS_FULL);
  const [upsertStorageLocation] = useMutation(UPSERT_STORAGE_LOCATION, {
    refetchQueries: [
      { query: gql`query AllStorageLocationNames { allStorageLocationNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });
  const [deleteStorageLocation] = useMutation(DELETE_STORAGE_LOCATION, {
    refetchQueries: [
      { query: gql`query AllStorageLocationNames { allStorageLocationNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", oldName: "" });

  const handleEdit = (name: string) => {
    const found = data?.storageLocations?.find((l: any) => l.name === name);
    setEditing(name);
    setForm({ name, description: found?.description || "", oldName: name });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await upsertStorageLocation({ variables: { input: { name: form.name, description: form.description, oldName: form.oldName } } });
    setEditing(null);
    setForm({ name: "", description: "", oldName: "" });
    await refetch();
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete storage location ${name}?`)) return;
    try {
      await deleteStorageLocation({ variables: { name } });
      await refetch();
    } catch (error: any) {
      alert(error.message || "Failed to delete storage location");
    }
  };

  const handleInsert = async () => {
    await upsertStorageLocation({ variables: { input: { name: form.name, description: form.description } } });
    setForm({ name: "", description: "", oldName: "" });
    await refetch();
  };

  return (
    <section className="storage-location-manager">
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingTop: 8, paddingBottom: 16, marginBottom: -1 }}>
        <h2 style={{ margin: 0, paddingBottom: 16 }}>Manage Storage Locations</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error loading storage locations</p>}
      </div>
      <table>
        <thead style={{ position: 'sticky', top: 'calc(8px + 2em + 32px)', background: '#fff', zIndex: 9, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <tr>
            <th style={{ background: '#fff' }}>Name</th>
            <th style={{ background: '#fff' }}>Description</th>
            <th style={{ background: '#fff' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.storageLocations?.map((l: any) => (
            (!editing || editing === l.name) && (
              <tr key={l.name}>
                <td>{editing === l.name ? <input name="name" value={form.name} onChange={handleChange} /> : l.name}</td>
                <td>{editing === l.name ? <input name="description" value={form.description} onChange={handleChange} /> : (l.description || "")}</td>
                <td>
                  {editing === l.name ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <span style={{ display: 'inline-block', width: 16 }} />
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(l.name)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginRight: 8 }}>
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button onClick={() => handleDelete(l.name)} className="danger" title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
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
              <td><input name="name" value={form.name} onChange={handleChange} /></td>
              <td><input name="description" value={form.description} onChange={handleChange} /></td>
              <td><button onClick={handleInsert}>Insert</button></td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default StorageLocationManager;
