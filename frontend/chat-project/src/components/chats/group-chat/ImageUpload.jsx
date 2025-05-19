import React, { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

export default function ImageUpload({ file, onChange, label = "Upload Image" }) {
  const [preview, setPreview] = useState(file ? URL.createObjectURL(file) : null);
  const inputRef = useRef();

  const handleFile = useCallback(
    (file) => {
      if (file) {
        setPreview(URL.createObjectURL(file));
        onChange(file);
      }
    },
    [onChange]
  );

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    handleFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  return (
    <Wrapper>
      <DropZone
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        hasPreview={!!preview}
      >
        {preview ? (
          <PreviewImage src={preview} alt="Preview" />
        ) : (
          <Placeholder>{label}</Placeholder>
        )}
        <HiddenInput
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
        />
      </DropZone>
      {preview && (
        <RemoveButton type="button" onClick={() => { setPreview(null); onChange(null); }}>
          Remove
        </RemoveButton>
      )}
    </Wrapper>
  );
}

ImageUpload.propTypes = {
  file: PropTypes.instanceOf(File),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

ImageUpload.defaultProps = {
  file: null,
  label: "Upload Image",
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const DropZone = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background-color: ${({ hasPreview }) => (hasPreview ? "transparent" : "#f9f9f9")};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;

  &:hover {
    border-color: #888;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const Placeholder = styled.span`
  color: #999;
  text-align: center;
  padding: 0 8px;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  margin-top: 8px;
  padding: 0.25rem 0.5rem;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background: #d9363e;
  }
`;
