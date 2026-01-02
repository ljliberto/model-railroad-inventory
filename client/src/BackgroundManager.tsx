import React from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_BACKGROUND, SET_BACKGROUND } from "./graphql";

interface Props {
  onClose: () => void;
}

const BackgroundManager: React.FC<Props> = ({ onClose }) => {
  const { data: bgData, refetch: refetchBackground } = useQuery(GET_BACKGROUND);
  const [setBackground] = useMutation(SET_BACKGROUND);

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
      alert("Please select a JPG or PNG image file");
      e.target.value = "";
      return;
    }

    // Validate file size (max 10MB for background)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      e.target.value = "";
      return;
    }

    // Check if background already exists
    const hasExisting = bgData?.background?.image;
    if (hasExisting) {
      const confirmed = window.confirm(
        "A background image already exists. Do you want to replace it with the new image?"
      );
      if (!confirmed) {
        e.target.value = "";
        return;
      }
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const result = await setBackground({ variables: { image: base64String } });
        console.log("Background set result:", result);
        await refetchBackground();
        alert("Background image updated successfully!");
      } catch (error) {
        console.error("Error setting background:", error);
        alert(`Failed to set background image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const backgroundImage = bgData?.background?.image || "";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0 }}>Background Image Manager</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            ✖️
          </button>
        </div>

        <div className="background-upload">
          <label className="background-upload-label">
            Select Background Image (JPG/PNG)
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleBackgroundUpload}
            />
          </label>
          {backgroundImage && (
            <div className="background-preview">
              <p>Current Background:</p>
              <img src={backgroundImage} alt="Background preview" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundManager;
