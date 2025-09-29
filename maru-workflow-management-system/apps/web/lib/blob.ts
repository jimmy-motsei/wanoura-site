import { BlobServiceClient } from '@azure/storage-blob'

export function getContainerClient(name = process.env.AZURE_STORAGE_CONTAINER || 'cv') {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!conn) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING not set')
  }

  const svc = BlobServiceClient.fromConnectionString(conn)
  return svc.getContainerClient(name)
}
