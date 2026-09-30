# File Sharing Specification

## Requirements
Users can:
- Select file
- Upload
- See upload progress where feasible
- Share file with meeting
- Download/access shared file

## Security
Validate:
- File size
- MIME type
- Extension
- Filename
- Authenticated uploader
- Meeting membership

Generate safe server-side storage names.

Never trust the original filename as a filesystem path.

## Recommended initial limits
Use a configurable maximum file size. Example:
`10 MB` for the first version.

## Storage abstraction
Create:
```text
StorageService
  upload()
  getUrl()
  delete()
```

The implementation can start with local disk and later switch to cloud object storage without rewriting the rest of the application.

## API
Use authenticated multipart upload.

## UI
Show:
- Filename
- Size
- Uploader
- Upload status
- Download/access action
- Error state
