param namePrefix string
resource sa 'Microsoft.Storage/storageAccounts@2023-01-01' = {
name: toLower('${namePrefix}workflowsa')
location: resourceGroup().location
sku: { name: 'Standard_LRS' }
kind: 'StorageV2'
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
name: '${sa.name}/default/cv'
properties: { publicAccess: 'None' }
}

output accountName string = sa.name
