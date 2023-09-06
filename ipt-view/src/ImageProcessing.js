import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function ImageProcessing() {
  const [file, setFile] = useState(null);
  const [operation, setOperation] = useState("resize");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [toType, setToType] = useState("png");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [imageType, setImageType] = useState("jpeg");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fileData = await convertToBase64(file);
    const data = {
      email: email,
      imageType: imageType,
      file: fileData,
      operation: operation,
    };

    if (operation === "resize") {
      data.width = width;
      data.height = height;
    } else if (operation === "convert") {
      data.toType = toType;
    }

    try {
      const response = await axios.post(
        API_URL,
        data
      );
      setNotification(response.data.message);
      setFile(null);
      setEmail("");
      setWidth("");
      setHeight("");
      setImageType("jpeg");
      setToType("png");
      setOperation("resize");
    } catch (err) {
      console.error("Error uploading the image:", err);
      setNotification("Error uploading the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let result = reader.result;
        const mimePattern = /^data:.+;base64,/;
        result = result.replace(mimePattern, "");
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="container mt-5" style={{ textAlign: 'left' }}>
      <h1 className="text-center mb-4">Image Processing Tool</h1>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {notification && (
            <div className="alert alert-info" role="alert">
              {notification}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Image Type</label>
              <select
                className="form-control"
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Operation</label>
              <select
                className="form-control"
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
              >
                <option value="resize">Resize</option>
                <option value="compress">Compress</option>
                <option value="convert">Convert</option>
                <option value="analyze">Analyze</option>
              </select>
            </div>
            {operation === "resize" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Width</label>
                  <input
                    type="number"
                    className="form-control"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Height</label>
                  <input
                    type="number"
                    className="form-control"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            {operation === "convert" && (
              <div className="mb-3">
                <label className="form-label">Convert To</label>
                <select
                  className="form-control"
                  value={toType}
                  onChange={(e) => setToType(e.target.value)}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary">
              Process Image
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default ImageProcessing;
