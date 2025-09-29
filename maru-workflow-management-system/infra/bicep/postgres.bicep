param namePrefix string
param location string

resource pg 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
name: '${namePrefix}-pg'
location: location
sku: { name: 'Standard_B1ms', tier: 'Burstable', capacity: 1 }
properties: {
version: '16'
storage: { storageSizeGB: 64 }
administratorLogin: 'maruadmin'
administratorLoginPassword: 'ReplaceMe123!'
network: { publicNetworkAccess: 'Enabled' }
}
}

output fqdn string = pg.properties.fullyQualifiedDomainName
