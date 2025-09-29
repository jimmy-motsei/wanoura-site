param namePrefix string
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
name: '${namePrefix}-kv'
location: resourceGroup().location
properties: {
tenantId: subscription().tenantId
sku: { family: 'A', name: 'standard' }
accessPolicies: []
enabledForDeployment: true
}
}
