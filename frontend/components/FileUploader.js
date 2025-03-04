import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Clear as ClearIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
  validateFile,
  formatFileSize,
  processImage,
  createObjectURL,
  revokeObjectURL,
  isImageUrl,
} from '../utils/fileUtils';

const FileUploader = ({
  onChange,
  value,
  error,
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  imageOptions = {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.8,
  },
  multiple = false,
  helperText,
  disabled = false,
}) => {
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const previewUrl = useRef(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (disabled) return;

    const file = acceptedFiles[0];
    const validation = validateFile(file, { maxSize, allowedTypes });
    
    if (validation !== true) {
      onChange(null, validation);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Clean up previous preview
      if (previewUrl.current) {
        revokeObjectURL(previewUrl.current);
      }

      // Create preview
      previewUrl.current = createObjectURL(file);
      setPreview(previewUrl.current);

      // Process image if it's an image file
      if (file.type.startsWith('image/')) {
        const processed = await processImage(file, imageOptions);
        setProgress(100);
        onChange(processed);
      } else {
        setProgress(100);
        onChange(file);
      }
    } catch (error) {
      onChange(null, 'Error processing file');
    } finally {
      setIsProcessing(false);
    }
  }, [disabled, maxSize, allowedTypes, imageOptions, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.join(','),
    multiple: false,
    disabled,
  });

  const handleClear = (e) => {
    e.stopPropagation();
    if (previewUrl.current) {
      revokeObjectURL(previewUrl.current);
    }
    setPreview(null);
    onChange(null);
  };

  // Clean up on unmount
  useRef(() => {
    if (previewUrl.current) {
      revokeObjectURL(previewUrl.current);
    }
  }, []);

  const showPreview = preview || (typeof value === 'string' && isImageUrl(value));
  const previewSrc = preview || value;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        borderColor: error ? 'error.main' : 'divider',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {showPreview ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 300,
              '&:hover .clear-button': {
                opacity: 1,
              },
            }}
          >
            <img
              src={previewSrc}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8,
              }}
            />
            {!disabled && (
              <IconButton
                className="clear-button"
                size="small"
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    bgcolor: 'background.paper',
                  },
                }}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>
        ) : (
          <>
            <UploadIcon color={disabled ? 'disabled' : 'primary'} sx={{ fontSize: 48 }} />
            <Typography
              variant="body1"
              color={disabled ? 'text.disabled' : 'text.primary'}
              align="center"
            >
              {isDragActive
                ? 'Drop the file here'
                : `Drag and drop or click to select ${
                    allowedTypes.includes('image/*') ? 'an image' : 'a file'
                  }`}
            </Typography>
            {helperText && (
              <Typography variant="caption" color="text.secondary" align="center">
                {helperText}
              </Typography>
            )}
          </>
        )}

        {isProcessing && (
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {error && (
          <Typography variant="caption" color="error" align="center">
            {error}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default FileUploader;