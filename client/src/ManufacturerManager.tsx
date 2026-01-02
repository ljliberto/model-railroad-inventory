import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_MANUFACTURERS, CREATE_MANUFACTURER, UPDATE_MANUFACTURER, DELETE_MANUFACTURER } from "./graphql";

const ManufacturerManager: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_MANUFACTURERS);
  const [createManufacturer] = useMutation(CREATE_MANUFACTURER, {
    refetchQueries: [
      { query: gql`query AllManufacturerNames { allManufacturerNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });
  const [updateManufacturer] = useMutation(UPDATE_MANUFACTURER, {
    refetchQueries: [
      { query: gql`query AllManufacturerNames { allManufacturerNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });
  const [deleteManufacturer] = useMutation(DELETE_MANUFACTURER, {
    refetchQueries: [
      { query: gql`query AllManufacturerNames { allManufacturerNames }` },
      { query: gql`query GetItems { inventoryItems { id image description category scale manufacturer modelFirstYear modelNumber acquiredFrom acquiredDate condition collectionName storageLocation variation originalBox created_timestamp updated_timestamp } }` }
    ]
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    yearIncorporated: "",
    defunct: false,
    oldName: ""
  });

  const handleEdit = async (name: string) => {
    setEditing(name);
    // Load the existing manufacturer data
    const manufacturer = data?.manufacturers?.find((m: any) => m.name === name);
    if (manufacturer) {
      setForm({
        name: manufacturer.name,
        description: manufacturer.description || "",
        yearIncorporated: manufacturer.yearIncorporated?.toString() || "",
        defunct: manufacturer.defunct || false,
        oldName: name
      });
    } else {
      setForm({ name, description: "", yearIncorporated: "", defunct: false, oldName: "" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    await updateManufacturer({ variables: { input: { name: form.name, description: form.description, yearIncorporated: form.yearIncorporated ? Number(form.yearIncorporated) : null, defunct: form.defunct, oldName: form.oldName } } });
    setEditing(null);
    setForm({ name: "", description: "", yearIncorporated: "", defunct: false, oldName: "" });
    await refetch();
  };

  // Uses the deleteManufacturer mutation
  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete manufacturer ${name}?`)) return;
    try {
      await deleteManufacturer({ variables: { name } });
      await refetch();
    } catch (error: any) {
      alert(error.message || "Failed to delete manufacturer");
    }
  };

  const handleInsert = async () => {
    await createManufacturer({ variables: { input: { name: form.name, description: form.description, yearIncorporated: form.yearIncorporated ? Number(form.yearIncorporated) : null, defunct: form.defunct } } });
    setForm({ name: "", description: "", yearIncorporated: "", defunct: false, oldName: "" });
    await refetch();
  };

  return (
    <section className="manufacturer-manager">
      <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, paddingTop: 8, paddingBottom: 16, marginBottom: -1 }}>
        <h2 style={{ margin: 0, paddingBottom: 16 }}>Manage Manufacturers</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error loading manufacturers</p>}
      </div>
      <table>
        <thead style={{ position: 'sticky', top: 'calc(8px + 2em + 32px)', background: '#fff', zIndex: 9, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <tr>
            <th style={{ background: '#fff' }}>Name</th>
            <th style={{ background: '#fff' }}>Description</th>
            <th style={{ background: '#fff' }}>Year Incorporated</th>
            <th style={{ background: '#fff' }}>Defunct</th>
            <th style={{ background: '#fff' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.manufacturers?.map((manufacturer: any) => (
            (!editing || editing === manufacturer.name) && (
              <tr key={manufacturer.name}>
                <td>{editing === manufacturer.name ? <input name="name" value={form.name} onChange={handleChange} /> : manufacturer.name}</td>
                <td>{editing === manufacturer.name ? <input name="description" value={form.description} onChange={handleChange} /> : manufacturer.description}</td>
                <td>{editing === manufacturer.name ? <input name="yearIncorporated" value={form.yearIncorporated} onChange={handleChange} /> : manufacturer.yearIncorporated}</td>
                <td>{editing === manufacturer.name ? <input type="checkbox" name="defunct" checked={form.defunct} onChange={handleChange} /> : manufacturer.defunct ? "Yes" : "No"}</td>
                <td>
                  {editing === manufacturer.name ? (
                    <>
                      <button onClick={handleSave}>Save</button>
                      <span style={{ display: 'inline-block', width: 16 }} />
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(manufacturer.name)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginRight: 8 }}>
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button onClick={() => handleDelete(manufacturer.name)} className="danger" title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>
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
              <td><input name="yearIncorporated" value={form.yearIncorporated} onChange={handleChange} /></td>
              <td><input type="checkbox" name="defunct" checked={form.defunct} onChange={handleChange} /></td>
              <td><button onClick={handleInsert}>Insert</button></td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ManufacturerManager;
