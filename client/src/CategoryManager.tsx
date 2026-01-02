import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";


const GET_CATEGORIES_FULL = gql`
  query GetCategoriesFull {
    categories {
      name
      description
    }
  }
`;

const UPSERT_CATEGORY = gql`
  mutation UpsertCategory($input: CategoryInput!) {
    upsertCategory(input: $input) {
      name
      description
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($name: String!) {
    deleteCategory(name: $name)
  }
`;


const CategoryManager: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES_FULL);
  const [upsertCategory] = useMutation(UPSERT_CATEGORY, {
    refetchQueries: [
      { query: gql`query AllCategoryNames { allCategoryNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [
      { query: gql`query AllCategoryNames { allCategoryNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", oldName: "" });

  const handleEdit = (name: string) => {
    const found = data?.categories?.find((c: any) => c.name === name);
    setEditing(name);
    setForm({ name, description: found?.description || "", oldName: name });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await upsertCategory({ variables: { input: { name: form.name, description: form.description, oldName: form.oldName } } });
    setEditing(null);
    setForm({ name: "", description: "", oldName: "" });
    await refetch();
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete category ${name}?`)) return;
    try {
      await deleteCategory({ variables: { name } });
      await refetch();
    } catch (error: any) {
      alert(error.message || "Failed to delete category");
    }
  };

  const handleInsert = async () => {
    await upsertCategory({ variables: { input: { name: form.name, description: form.description } } });
    setForm({ name: "", description: "", oldName: "" });
    await refetch();
  };

  return (
    <section className="category-manager">
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingTop: 8, paddingBottom: 16, marginBottom: -1 }}>
        <h2 style={{ margin: 0, paddingBottom: 16 }}>Manage Categories</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error loading categories</p>}
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
          {data?.categories?.map((c: any) => (
            (!editing || editing === c.name) && (
              <tr key={c.name}>
                <td>{editing === c.name ? <input name="name" value={form.name} onChange={handleChange} /> : c.name}</td>
                <td>{editing === c.name ? <input name="description" value={form.description} onChange={handleChange} /> : (c.description || "")}</td>
                <td>
                  {editing === c.name ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <span style={{ display: 'inline-block', width: 16 }} />
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(c.name)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginRight: 8 }}>
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button onClick={() => handleDelete(c.name)} className="danger" title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
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

export default CategoryManager;
