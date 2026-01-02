import React, { useState } from "react";
import { useState as useReactState } from "react";
import ManufacturerManager from "./ManufacturerManager";
import ManageScale from "./ManageScale";
import SourceManager from "./SourceManager";
import StorageLocationManager from "./StorageLocationManager";
import CategoryManager from "./CategoryManager";
import BackgroundManager from "./BackgroundManager";
import { useEffect, useCallback } from "react";
import AdminPopup from "./AdminPopup";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ITEMS, CREATE_ITEM, UPDATE_ITEM, DELETE_ITEM, GET_BACKGROUND, GET_MANUFACTURER_NAMES, GET_SCALES, GET_SOURCE_NAMES, GET_STORAGE_LOCATION_NAMES, GET_CATEGORY_NAMES, UPSERT_CATEGORY, UPSERT_SCALE, UPSERT_SOURCE, UPSERT_STORAGE_LOCATION, UPDATE_MANUFACTURER } from "./graphql";
import type { InventoryItem, InventoryInput } from "./types";
import ExcelJS from "exceljs";

const emptyForm: InventoryInput = {
  image: "",
  description: "",
  category: "",
  scale: "O",
  manufacturer: "",
  modelFirstYear: "",
  modelNumber: "",
  acquiredFrom: "",
  acquiredDate: "",
  condition: "Fair",
  collectionName: "",
  storageLocation: "",
  variation: "",
  originalBox: false,
  originalValue: "",
  estimatedValue: ""
};

const App: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_ITEMS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });
  const { data: bgData, refetch: refetchBackground } = useQuery(GET_BACKGROUND);
  const [createItem] = useMutation(CREATE_ITEM);
  const [updateItem] = useMutation(UPDATE_ITEM);
  const [deleteItem] = useMutation(DELETE_ITEM);
  const [upsertCategory] = useMutation(UPSERT_CATEGORY);
  const [upsertScale] = useMutation(UPSERT_SCALE);
  const [upsertSource] = useMutation(UPSERT_SOURCE);
  const [upsertStorageLocation] = useMutation(UPSERT_STORAGE_LOCATION);
  const [upsertManufacturer] = useMutation(UPDATE_MANUFACTURER);

  // Manufacturer dropdown state
  const { data: manufacturerData, loading: manufacturerLoading, error: manufacturerError, refetch: refetchManufacturers } = useQuery(GET_MANUFACTURER_NAMES);

  // Scale dropdown state
  const { data: scaleData, loading: scaleLoading, error: scaleError, refetch: refetchScales } = useQuery(GET_SCALES);

  // Source dropdown state
  const { data: sourceData, loading: sourceLoading, error: sourceError, refetch: refetchSources } = useQuery(GET_SOURCE_NAMES);

  // Storage Location dropdown state
  const { data: storageLocationData, loading: storageLocationLoading, error: storageLocationError, refetch: refetchStorageLocations } = useQuery(GET_STORAGE_LOCATION_NAMES);

  // Category dropdown state
  const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: refetchCategories } = useQuery(GET_CATEGORY_NAMES);

  const [form, setForm] = useState<InventoryInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);
  const [sortPrimary, setSortPrimary] = useState<string>("description");
  const [sortSecondary, setSortSecondary] = useState<string>("");
  const [sortTertiary, setSortTertiary] = useState<string>("");
  const [sortPrimaryDir, setSortPrimaryDir] = useState<'asc' | 'desc'>('asc');
  const [sortSecondaryDir, setSortSecondaryDir] = useState<'asc' | 'desc'>('asc');
  const [sortTertiaryDir, setSortTertiaryDir] = useState<'asc' | 'desc'>('asc');
  // (already declared above, do not redeclare)
  const [showScaleManager, setShowScaleManager] = useReactState(false);
  // (already declared above, do not redeclare)
  const [showAdminPopup, setShowAdminPopup] = useReactState(false);
  // Show SourceManager modal
  const [showSourceManager, setShowSourceManager] = useReactState(false);
  // Show StorageLocationManager modal
  const [showStorageLocationManager, setShowStorageLocationManager] = useReactState(false);
  // Show full-scale image popup
  const [fullscaleImage, setFullscaleImage] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Extract filename without extension for description
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    
    // Pre-populate description if it's empty
    if (!form.description) {
      setForm((prev) => ({ ...prev, description: fileNameWithoutExt }));
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm((prev) => ({ ...prev, image: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setImagePreview(item.image);
    setForm({
      image: item.image,
      description: item.description,
      category: item.category,
      scale: item.scale,
      manufacturer: item.manufacturer,
      modelFirstYear: item.modelFirstYear?.toString() ?? "",
      modelNumber: item.modelNumber ?? "",
      acquiredFrom: item.acquiredFrom ?? "",
      acquiredDate: item.acquiredDate ?? "",
      condition: item.condition ?? "",
      collectionName: item.collectionName ?? "",
      storageLocation: item.storageLocation ?? "",
      variation: item.variation ?? "",
      originalBox: item.originalBox,
      originalValue: item.originalValue?.toString() ?? "",
      estimatedValue: item.estimatedValue?.toString() ?? ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      ...form,
      modelFirstYear: form.modelFirstYear ? Number(form.modelFirstYear) : null,
      acquiredDate: form.acquiredDate || null,
      originalValue: form.originalValue ? Number(form.originalValue) : null,
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null
    };

    if (editingId) {
      await updateItem({ variables: { id: editingId, input } });
    } else {
      await createItem({ variables: { input } });
    }

    await refetch();
    setForm(emptyForm);
    setEditingId(null);
    setImagePreview("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteItem({ variables: { id } });
    await refetch();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
  };

  const handleClear = () => {
    setForm(emptyForm);
    setImagePreview("");
  };

  const handleExport = async () => {
    if (!sortedItems || sortedItems.length === 0) {
      alert("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Inventory");

      // Define columns
      worksheet.columns = [
        { header: "Image", key: "image", width: 15 },
        { header: "Description", key: "description", width: 30 },
        { header: "Category", key: "category", width: 20 },
        { header: "Scale", key: "scale", width: 10 },
        { header: "Manufacturer", key: "manufacturer", width: 20 },
        { header: "Model First Year", key: "modelFirstYear", width: 15 },
        { header: "Model Number", key: "modelNumber", width: 20 },
        { header: "Acquired From", key: "acquiredFrom", width: 25 },
        { header: "Acquired Date", key: "acquiredDate", width: 15 },
        { header: "Condition", key: "condition", width: 15 },
        { header: "Collection Name", key: "collectionName", width: 25 },
        { header: "Storage Location", key: "storageLocation", width: 25 },
        { header: "Variation", key: "variation", width: 25 },
        { header: "Original Box", key: "originalBox", width: 12 },
        { header: "Original Value", key: "originalValue", width: 15 },
        { header: "Estimated Value", key: "estimatedValue", width: 15 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };

      // Freeze the header row (first row stays visible when scrolling)
      worksheet.views = [
        { state: "frozen", xSplit: 0, ySplit: 1 }
      ];

      // Add data and images
      for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        const rowIndex = i + 2; // +2 because row 1 is header and Excel is 1-indexed

        // Add row data
        worksheet.addRow({
          image: "", // Will add image separately
          description: item.description,
          category: item.category,
          scale: item.scale,
          manufacturer: item.manufacturer,
          modelFirstYear: item.modelFirstYear || "",
          modelNumber: item.modelNumber || "",
          acquiredFrom: item.acquiredFrom || "",
          acquiredDate: item.acquiredDate || "",
          condition: item.condition || "",
          collectionName: item.collectionName || "",
          variation: item.variation || "",
          originalBox: item.originalBox ? "Yes" : "No",
          originalValue: item.originalValue || "",
          estimatedValue: item.estimatedValue || "",
        });

        // Set row height for image
        worksheet.getRow(rowIndex).height = 80;

        // Add image if available
        if (item.image) {
          try {
            // Extract base64 data
            const base64Data = item.image.split(",")[1] || item.image;
            const extension = item.image.match(/image\/(png|jpg|jpeg)/)?.[1] || "png";
            
            const imageId = workbook.addImage({
              base64: base64Data,
              extension: extension as "png" | "jpeg",
            });

            worksheet.addImage(imageId, {
              tl: { col: 0, row: rowIndex - 1 },
              ext: { width: 100, height: 75 },
            });
          } catch (err) {
            console.error("Error adding image for item", item.id, err);
          }
        }
      }

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ModelRailroadInventory-${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet("Inventory");
      if (!worksheet) {
        alert("Invalid Excel file: 'Inventory' worksheet not found");
        setImporting(false);
        return;
      }

      // First pass: collect all rows and check for duplicates
      const rowsToImport: Array<{ rowIndex: number; input: any; isDuplicate: boolean; matchingItems: InventoryItem[] }> = [];
      
      for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
        const row = worksheet.getRow(rowIndex);
        
        // Skip empty rows
        if (!row.getCell(2).value) continue;

        try {
          // Extract image from Excel
          let imageBase64 = "";
          const images = worksheet.getImages();
          const imageInRow = images.find((img) => {
            const range = img.range as any;
            return range.tl.row === rowIndex - 1; // Excel uses 0-based for image ranges
          });

          if (imageInRow) {
            const imageId = Number(imageInRow.imageId);
            const image = workbook.getImage && workbook.getImage(imageId);
            if (image && image.buffer) {
              // Convert buffer (Uint8Array) to base64
              let binary = '';
              const bytes = new Uint8Array(image.buffer);
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const base64 = window.btoa(binary);
              const extension = image.extension || 'png';
              imageBase64 = `data:image/${extension};base64,${base64}`;
            }
          }

          // If no image found in Excel, use a placeholder or skip
          if (!imageBase64) {
            console.warn(`No image found for row ${rowIndex}, skipping item`);
            continue;
          }

          const input = {
            image: imageBase64,
            description: row.getCell(2).value?.toString() || "",
            category: row.getCell(3).value?.toString() || "Other",
            scale: row.getCell(4).value?.toString() || "Other",
            manufacturer: row.getCell(5).value?.toString() || "",
            modelFirstYear: row.getCell(6).value ? Number(row.getCell(6).value) : null,
            modelNumber: row.getCell(7).value?.toString() || null,
            acquiredFrom: row.getCell(8).value?.toString() || null,
            acquiredDate: row.getCell(9).value?.toString() || null,
            condition: row.getCell(10).value?.toString() || "Fair",
            collectionName: row.getCell(11).value?.toString() || null,
            storageLocation: row.getCell(12).value?.toString() || null,
            variation: row.getCell(13).value?.toString() || null,
            originalBox: row.getCell(14).value?.toString().toLowerCase() === "yes",
            originalValue: row.getCell(15).value ? Number(row.getCell(15).value) : null,
            estimatedValue: row.getCell(16).value ? Number(row.getCell(16).value) : null,
          };

          // Check for duplicates in existing inventory
          const matchingItems = items.filter(item => 
            item.description.toLowerCase() === input.description.toLowerCase() &&
            item.manufacturer.toLowerCase() === input.manufacturer.toLowerCase() &&
            (item.modelNumber?.toLowerCase() || "") === (input.modelNumber?.toLowerCase() || "")
          );

          rowsToImport.push({
            rowIndex,
            input,
            isDuplicate: matchingItems.length > 0,
            matchingItems
          });
        } catch (error) {
          console.error(`Error processing row ${rowIndex}:`, error);
        }
      }

      // Check if there are any duplicates
      const duplicates = rowsToImport.filter(row => row.isDuplicate);
      
      if (duplicates.length > 0) {
        const duplicateList = duplicates.slice(0, 5).map(dup => 
          `• ${dup.input.description} - ${dup.input.manufacturer}${dup.input.modelNumber ? ` (${dup.input.modelNumber})` : ""}`
        ).join('\n');
        
        const moreText = duplicates.length > 5 ? `\n...and ${duplicates.length - 5} more` : "";
        
        const userChoice = window.confirm(
          `Found ${duplicates.length} potential duplicate(s):\n\n${duplicateList}${moreText}\n\n` +
          `These items already exist in your inventory.\n\n` +
          `Click OK to SKIP duplicates and only import new items.\n` +
          `Click Cancel to IMPORT ALL items (including duplicates).`
        );

        if (userChoice) {
          // Skip duplicates - only import items that are not duplicates
          rowsToImport.splice(0, rowsToImport.length, ...rowsToImport.filter(row => !row.isDuplicate));
        }
        // If user clicks Cancel, import everything (no filtering needed)
      }

      // Second pass: actually import the items
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = duplicates.length > 0 && rowsToImport.length < duplicates.length + rowsToImport.length 
        ? duplicates.length 
        : 0;

      // Collect unique values for each entity type
      const uniqueCategories = new Set<string>();
      const uniqueManufacturers = new Set<string>();
      const uniqueScales = new Set<string>();
      const uniqueSources = new Set<string>();
      const uniqueStorageLocations = new Set<string>();

      for (const rowData of rowsToImport) {
        if (rowData.input.category) uniqueCategories.add(rowData.input.category);
        if (rowData.input.manufacturer) uniqueManufacturers.add(rowData.input.manufacturer);
        if (rowData.input.scale) uniqueScales.add(rowData.input.scale);
        if (rowData.input.acquiredFrom) uniqueSources.add(rowData.input.acquiredFrom);
        if (rowData.input.storageLocation) uniqueStorageLocations.add(rowData.input.storageLocation);
      }

      // Get existing entity names
      const existingCategories = new Set(categoryData?.allCategoryNames || []);
      const existingManufacturers = new Set(manufacturerData?.allManufacturerNames || []);
      const existingScales = new Set(scaleData?.uniqueScales || []);
      const existingSources = new Set(sourceData?.allSourceNames || []);
      const existingStorageLocations = new Set(storageLocationData?.allStorageLocationNames || []);

      // Create missing entities
      for (const category of uniqueCategories) {
        if (!existingCategories.has(category)) {
          try {
            await upsertCategory({ variables: { input: { name: category } } });
          } catch (error) {
            console.error(`Error creating category "${category}":`, error);
          }
        }
      }

      for (const manufacturer of uniqueManufacturers) {
        if (!existingManufacturers.has(manufacturer)) {
          try {
            await upsertManufacturer({ variables: { input: { name: manufacturer } } });
          } catch (error) {
            console.error(`Error creating manufacturer "${manufacturer}":`, error);
          }
        }
      }

      for (const scale of uniqueScales) {
        if (!existingScales.has(scale)) {
          try {
            await upsertScale({ variables: { input: { scale: scale } } });
          } catch (error) {
            console.error(`Error creating scale "${scale}":`, error);
          }
        }
      }

      for (const source of uniqueSources) {
        if (!existingSources.has(source)) {
          try {
            await upsertSource({ variables: { input: { name: source } } });
          } catch (error) {
            console.error(`Error creating source "${source}":`, error);
          }
        }
      }

      for (const storageLocation of uniqueStorageLocations) {
        if (!existingStorageLocations.has(storageLocation)) {
          try {
            await upsertStorageLocation({ variables: { input: { name: storageLocation } } });
          } catch (error) {
            console.error(`Error creating storage location "${storageLocation}":`, error);
          }
        }
      }

      // Refetch all entity lists to ensure they're up to date
      await Promise.all([
        refetchCategories(),
        refetchManufacturers(),
        refetchScales(),
        refetchSources(),
        refetchStorageLocations()
      ]);

      // Now import the inventory items
      for (const rowData of rowsToImport) {
        try {
          await createItem({ variables: { input: rowData.input } });
          successCount++;
        } catch (error) {
          console.error(`Error importing row ${rowData.rowIndex}:`, error);
          errorCount++;
        }
      }

      await refetch();
      
      const message = skippedCount > 0
        ? `Import complete!\nSuccessfully imported: ${successCount}\nSkipped duplicates: ${skippedCount}\nErrors: ${errorCount}`
        : `Import complete!\nSuccessfully imported: ${successCount}\nErrors: ${errorCount}`;
      
      alert(message);
    } catch (error) {
      console.error("Error importing Excel file:", error);
      alert("Failed to import data. Please ensure the file format is correct.");
    } finally {
      setImporting(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const items: InventoryItem[] = data?.inventoryItems ?? [];

  const backgroundImage = bgData?.background?.image || "";

  const sortedItems = React.useMemo(() => {
    const itemsCopy = [...items];
    
    return itemsCopy.sort((a, b) => {
      const sortFields = [
        { field: sortPrimary, dir: sortPrimaryDir },
        { field: sortSecondary, dir: sortSecondaryDir },
        { field: sortTertiary, dir: sortTertiaryDir }
      ].filter(s => s.field);
      
      for (const { field, dir } of sortFields) {
        let aValue = a[field as keyof InventoryItem];
        let bValue = b[field as keyof InventoryItem];
        
        // Handle null/undefined values
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        // Convert to strings for comparison (handles dates and numbers)
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        let comparison = 0;
        if (aStr < bStr) comparison = -1;
        if (aStr > bStr) comparison = 1;
        
        if (comparison !== 0) {
          return dir === 'asc' ? comparison : -comparison;
        }
      }
      
      return 0;
    });
  }, [items, sortPrimary, sortSecondary, sortTertiary, sortPrimaryDir, sortSecondaryDir, sortTertiaryDir]);

  const getAvailableSortOptions = (currentSelector: 'primary' | 'secondary' | 'tertiary') => {
    const allOptions = [
      { value: "description", label: "Description" },
      { value: "category", label: "Category" },
      { value: "scale", label: "Scale" },
      { value: "manufacturer", label: "Manufacturer" },
      { value: "modelNumber", label: "Model Number" },
      { value: "acquiredDate", label: "Acquired Date" },
      { value: "created_timestamp", label: "Created Date" },
      { value: "updated_timestamp", label: "Updated Date" },
    ];

    const usedValues: string[] = [];
    if (currentSelector !== 'primary') usedValues.push(sortPrimary);
    if (currentSelector !== 'secondary' && sortSecondary) usedValues.push(sortSecondary);
    if (currentSelector !== 'tertiary' && sortTertiary) usedValues.push(sortTertiary);

    return allOptions.filter(option => !usedValues.includes(option.value));
  };

  const handleSortRefresh = () => {
    // Force a re-render by toggling a state that triggers the sort
    refetch();
  };

  const [showManufacturerManager, setShowManufacturerManager] = useReactState(false);
  const [showCategoryManager, setShowCategoryManager] = useReactState(false);
  const [showBackgroundManager, setShowBackgroundManager] = useReactState(false);

  return (
    <div className="app-root" style={backgroundImage ? {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    } : {}}>
      <header>
        <div className="inventory-heading-wrapper">
          <h1 className="inventory-heading">Model Railroad Inventory</h1>
        </div>
        <p>Track your locomotives, rolling stock, and accessories.</p>
        {/* Single Admin glyph for popup */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '0 2.5rem 0 0', position: 'relative', top: 0 }}>
          <button
            title="Administration"
            aria-label="Administration"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28 }}
            onClick={() => setShowAdminPopup(true)}
          >
            <span role="img" aria-label="Administration">⚙️</span>
          </button>
        </div>
      </header>

      <main className="layout">
        {showAdminPopup && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 100 }}>
            <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 101 }}>
              <AdminPopup
                onClose={() => { setShowAdminPopup(false); if (typeof document !== 'undefined') document.body.style.overflow = ''; }}
                onShowManufacturer={() => { setShowAdminPopup(false); setShowManufacturerManager(true); }}
                onShowScale={() => { setShowAdminPopup(false); setShowScaleManager(true); }}
                onShowSource={() => { setShowAdminPopup(false); setShowSourceManager(true); }}
                onShowStorageLocation={() => { setShowAdminPopup(false); setShowStorageLocationManager(true); }}
                onShowCategory={() => { setShowAdminPopup(false); setShowCategoryManager(true); }}
                onShowBackground={() => { setShowAdminPopup(false); setShowBackgroundManager(true); }}
              />
            </div>
          </div>
        )}

        {showSourceManager && (
          <>
            {typeof document !== 'undefined' && (document.body.style.overflow = 'hidden')}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 110 }}>
              <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 32, borderRadius: 8, minWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                <button style={{ position: 'sticky', top: 0, float: 'right', fontSize: 22, background: '#fff', border: 'none', cursor: 'pointer', zIndex: 11 }} onClick={() => { setShowSourceManager(false); setShowAdminPopup(true); }} title="Close">✖️</button>
                <SourceManager />
              </div>
            </div>
          </>
        )}
        {showManufacturerManager && (
          <>
            {typeof document !== 'undefined' && (document.body.style.overflow = 'hidden')}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 110 }}>
              <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 32, borderRadius: 8, minWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                <button style={{ position: 'sticky', top: 0, float: 'right', fontSize: 22, background: '#fff', border: 'none', cursor: 'pointer', zIndex: 11 }} onClick={() => { setShowManufacturerManager(false); setShowAdminPopup(true); }} title="Close">✖️</button>
                <ManufacturerManager />
              </div>
            </div>
          </>
        )}
        {showScaleManager && (
          <>
            {typeof document !== 'undefined' && (document.body.style.overflow = 'hidden')}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 110 }}>
              <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 32, borderRadius: 8, minWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                <button
                  style={{ position: 'sticky', top: 0, float: 'right', fontSize: 22, background: '#fff', border: 'none', cursor: 'pointer', zIndex: 11 }}
                  onClick={async () => {
                    setShowScaleManager(false);
                    setShowAdminPopup(true);
                    if (typeof scaleData !== 'undefined' && typeof scaleLoading !== 'undefined' && typeof scaleError !== 'undefined' && typeof refetch === 'function') {
                      await refetch(); // refetch GET_SCALES
                    }
                  }}
                  title="Close"
                >
                  ✖️
                </button>
                <ManageScale onScalesChanged={refetchScales} />
              </div>
            </div>
          </>
        )}
        {showStorageLocationManager && (
          <>
            {typeof document !== 'undefined' && (document.body.style.overflow = 'hidden')}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 110 }}>
              <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 32, borderRadius: 8, minWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                <button style={{ position: 'sticky', top: 0, float: 'right', fontSize: 22, background: '#fff', border: 'none', cursor: 'pointer', zIndex: 11 }} onClick={() => { setShowStorageLocationManager(false); setShowAdminPopup(true); }} title="Close">✖️</button>
                <StorageLocationManager />
              </div>
            </div>
          </>
        )}
        {showCategoryManager && (
          <>
            {typeof document !== 'undefined' && (document.body.style.overflow = 'hidden')}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 110 }}>
              <div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: 32, borderRadius: 8, minWidth: 600, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                <button style={{ position: 'sticky', top: 0, float: 'right', fontSize: 22, background: '#fff', border: 'none', cursor: 'pointer', zIndex: 11 }} onClick={() => { setShowCategoryManager(false); setShowAdminPopup(true); }} title="Close">✖️</button>
                <CategoryManager />
              </div>
            </div>
          </>
        )}

        {showBackgroundManager && (
          <BackgroundManager onClose={() => { setShowBackgroundManager(false); setShowAdminPopup(true); }} />
        )}

        <div className="left-column">
          <section className="form-section">
            <h2>{editingId ? "Edit Item" : "Add New Item"}</h2>
            <form onSubmit={handleSubmit} className="inventory-form">
              <label>
                Image (JPG/PNG, max 5MB)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingId && !form.image}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categoryLoading && <option value="">Loading categories...</option>}
                {categoryError && <option value="">Error loading categories</option>}
                {categoryData?.allCategoryNames?.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Scale
              <select
                name="scale"
                value={form.scale}
                onChange={handleChange}
                required
                disabled={scaleLoading || !!scaleError}
              >
                <option value="">Select Scale</option>
                {scaleData?.uniqueScales?.map((scale: string) => (
                  <option key={scale} value={scale}>{scale}</option>
                ))}
              </select>
              {scaleLoading && <span style={{ marginLeft: '1rem', color: '#888' }}>Loading...</span>}
              {scaleError && <span style={{ marginLeft: '1rem', color: 'red' }}>Error loading scales</span>}
            </label>

            <label>
              Manufacturer
              <select
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                required
                disabled={manufacturerLoading || !!manufacturerError}
              >
                <option value="">Select Manufacturer</option>
                {manufacturerData?.allManufacturerNames?.map((name: string) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {manufacturerLoading && <span style={{ marginLeft: '1rem', color: '#888' }}>Loading...</span>}
              {manufacturerError && <span style={{ marginLeft: '1rem', color: 'red' }}>Error loading manufacturers</span>}
            </label>

            <label>
              Model First Year
              <input
                type="number"
                name="modelFirstYear"
                value={form.modelFirstYear}
                onChange={handleChange}
                placeholder="e.g. 1952"
              />
            </label>

            <label>
              Model Number
              <input
                type="text"
                name="modelNumber"
                value={form.modelNumber}
                onChange={handleChange}
              />
            </label>

            <label>
              Acquired From
              <select
                name="acquiredFrom"
                value={form.acquiredFrom}
                onChange={handleChange}
              >
                <option value="">Select a source...</option>
                {sourceData?.allSourceNames?.map((name: string) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Acquired Date
              <input
                type="date"
                name="acquiredDate"
                value={form.acquiredDate}
                onChange={handleChange}
              />
            </label>

            <label>
              Condition
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required
              >
                <option value="">Select Condition</option>
                <option value="Mint">Mint</option>
                <option value="Exellent">Exellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </label>

            <label>
              Collection Name
              <input
                type="text"
                name="collectionName"
                value={form.collectionName}
                onChange={handleChange}
              />
            </label>

            <label>
              Storage Location
              <select
                name="storageLocation"
                value={form.storageLocation}
                onChange={handleChange}
              >
                <option value="">Select a location...</option>
                {storageLocationData?.allStorageLocationNames?.map((name: string) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Variation
              <input
                type="text"
                name="variation"
                value={form.variation}
                onChange={handleChange}
                placeholder="Open Spoke Wheels, Thin Trim, etc."
              />
            </label>

            <label>
              Original Value ($)
              <input
                type="number"
                name="originalValue"
                value={form.originalValue}
                onChange={handleChange}
                placeholder="e.g. 125.00"
                step="0.01"
                min="0"
              />
            </label>

            <label>
              Estimated Value ($)
              <input
                type="number"
                name="estimatedValue"
                value={form.estimatedValue}
                onChange={handleChange}
                placeholder="e.g. 275.00"
                step="0.01"
                min="0"
              />
            </label>

            <label className="checkbox-row">
              <span style={{ marginRight: '0.5rem', whiteSpace: 'nowrap' }}>Original Box</span>
              <input
                type="checkbox"
                name="originalBox"
                checked={form.originalBox}
                onChange={handleChange}
                style={{ verticalAlign: 'middle', whiteSpace: 'nowrap', flex: 'none' }}
              />
            </label>

            <div className="form-actions">
              <button type="submit">
                {editingId ? "Save Changes" : "Add Item"}
              </button>
              {editingId ? (
                <button type="button" onClick={handleCancel} className="secondary">
                  Cancel
                </button>
              ) : (
                <button type="button" onClick={handleClear} className="secondary">
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>
        </div>

        <section className="list-section">
          <div className="list-header">
            <h2>Inventory</h2>
            <div className="list-actions">
              <label className="import-btn">
                {importing ? "Importing..." : "Import from Excel"}
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleImport}
                  disabled={importing}
                  style={{ display: "none" }}
                />
              </label>
              {items.length > 0 && (
                <button onClick={handleExport} className="export-btn">
                  Export to Excel
                </button>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <div className="sort-controls">
              <div className="sort-field">
                <label>
                  Primary Sort:
                  <div className="sort-input-group">
                    <select value={sortPrimary} onChange={(e) => setSortPrimary(e.target.value)}>
                      {getAvailableSortOptions('primary').map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="sort-direction-btn"
                      onClick={() => setSortPrimaryDir(sortPrimaryDir === 'asc' ? 'desc' : 'asc')}
                      title={sortPrimaryDir === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sortPrimaryDir === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </label>
              </div>
              <div className="sort-field">
                <label>
                  Secondary Sort:
                  <div className="sort-input-group">
                    <select value={sortSecondary} onChange={(e) => setSortSecondary(e.target.value)}>
                      <option value="">None</option>
                      {getAvailableSortOptions('secondary').map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {sortSecondary && (
                      <button
                        type="button"
                        className="sort-direction-btn"
                        onClick={() => setSortSecondaryDir(sortSecondaryDir === 'asc' ? 'desc' : 'asc')}
                        title={sortSecondaryDir === 'asc' ? 'Ascending' : 'Descending'}
                      >
                        {sortSecondaryDir === 'asc' ? '↑' : '↓'}
                      </button>
                    )}
                  </div>
                </label>
              </div>
              <div className="sort-field">
                <label>
                  Tertiary Sort:
                  <div className="sort-input-group">
                    <select value={sortTertiary} onChange={(e) => setSortTertiary(e.target.value)}>
                      <option value="">None</option>
                      {getAvailableSortOptions('tertiary').map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {sortTertiary && (
                      <button
                        type="button"
                        className="sort-direction-btn"
                        onClick={() => setSortTertiaryDir(sortTertiaryDir === 'asc' ? 'desc' : 'asc')}
                        title={sortTertiaryDir === 'asc' ? 'Ascending' : 'Descending'}
                      >
                        {sortTertiaryDir === 'asc' ? '↑' : '↓'}
                      </button>
                    )}
                  </div>
                </label>
              </div>
              <div className="sort-actions">
                <button onClick={handleSortRefresh} className="refresh-btn" title="Refresh display">
                  ↻ Refresh
                </button>
              </div>
            </div>
          )}

          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {!loading && items.length === 0 && <p>No items yet. Add your first locomotive!</p>}

          <div className="inventory-grid">
            {sortedItems.map((item) => (
              <article key={item.id} className="inventory-card">
                <div className="image-wrapper">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.description}
                      onClick={() => setFullscaleImage(item.image)}
                      style={{ cursor: 'pointer' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                <div className="card-body">
                  <h3>{item.description}</h3>
                  <p className="muted">
                    {item.scale} • {item.category} • {item.manufacturer}
                  </p>
                  <dl>
                    {item.modelNumber && (
                      <>
                        <dt>Model #</dt>
                        <dd>{item.modelNumber}</dd>
                      </>
                    )}
                    {item.modelFirstYear && (
                      <>
                        <dt>First Year</dt>
                        <dd>{item.modelFirstYear}</dd>
                      </>
                    )}
                    {item.collectionName && (
                      <>
                        <dt>Collection</dt>
                        <dd>{item.collectionName}</dd>
                      </>
                    )}
                    {item.storageLocation && (
                      <>
                        <dt>Storage</dt>
                        <dd>{item.storageLocation}</dd>
                      </>
                    )}
                    {item.variation && (
                      <>
                        <dt>Variation</dt>
                        <dd>{item.variation }</dd>
                      </>
                    )}
                    {item.originalValue && (
                      <>
                        <dt>Original Value</dt>
                        <dd>${item.originalValue.toFixed(2)}</dd>
                      </>
                    )}
                    {item.estimatedValue && (
                      <>
                        <dt>Estimated Value</dt>
                        <dd>${item.estimatedValue.toFixed(2)}</dd>
                      </>
                    )}
                    {item.condition && (
                      <>
                        <dt>Condition</dt>
                        <dd>{item.condition}</dd>
                      </>
                    )}
                    {item.acquiredFrom && (
                      <>
                        <dt>Acquired From</dt>
                        <dd>{item.acquiredFrom}</dd>
                      </>
                    )}
                    {item.acquiredDate && (
                      <>
                        <dt>Acquired Date</dt>
                        <dd>{(() => {
                          const date = new Date(item.acquiredDate);
                          return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                        })()}</dd>
                      </>
                    )}
                    <dt>Original Box</dt>
                    <dd>{item.originalBox ? "Yes" : "No"}</dd>
                    <dt>Last Updated</dt>
                    <dd>{(() => {
                      const date = new Date(item.updated_timestamp);
                      const dateStr = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                      const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                      return `${dateStr} ${timeStr}`;
                    })()}</dd>
                  </dl>

                  <div className="card-actions">
                    <button onClick={() => handleEdit(item)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginRight: 8 }}>
                      <span role="img" aria-label="edit">✏️</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="danger"
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
                    >
                      <span role="img" aria-label="delete">🗑️</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {fullscaleImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'auto'
          }}
          onClick={() => {
            setFullscaleImage(null);
            setImageZoom(1);
          }}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setImageZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                fontSize: '28px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                padding: '8px',
                zIndex: 201
              }}
              onClick={(e) => {
                e.stopPropagation();
                setFullscaleImage(null);
                setImageZoom(1);
              }}
              title="Close"
            >
              ✖️
            </button>
            
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                left: '0',
                display: 'flex',
                gap: '8px',
                zIndex: 201
              }}
            >
              <button
                style={{
                  fontSize: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  fontWeight: 'bold'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoom(prev => Math.min(5, prev + 0.25));
                }}
                title="Zoom In"
              >
                +
              </button>
              <button
                style={{
                  fontSize: '20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  fontWeight: 'bold'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoom(prev => Math.max(0.5, prev - 0.25));
                }}
                title="Zoom Out"
              >
                −
              </button>
              <button
                style={{
                  fontSize: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px 12px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoom(1);
                }}
                title="Reset Zoom"
              >
                {Math.round(imageZoom * 100)}%
              </button>
            </div>
            
            <img
              src={fullscaleImage}
              alt="Full size"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '4px',
                transform: `scale(${imageZoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.1s ease-out'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
