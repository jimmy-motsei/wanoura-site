param location string = resourceGroup().location
param namePrefix string = 'maru'

module appinsights 'appinsights.bicep' = {
name: '${namePrefix}-insights'
params: { namePrefix: namePrefix }
}

module storage 'storage.bicep' = {
name: '${namePrefix}-storage'
params: { namePrefix: namePrefix }
}

module postgres 'postgres.bicep' = {
name: '${namePrefix}-pg'
params: { namePrefix: namePrefix, location: location }
}

module keyvault 'keyvault.bicep' = {
name: '${namePrefix}-kv'
params: { namePrefix: namePrefix }
}
