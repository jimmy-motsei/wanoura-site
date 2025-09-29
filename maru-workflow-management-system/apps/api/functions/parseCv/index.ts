import { AzureFunction, Context } from "@azure/functions"

const activity: AzureFunction = async function (context: Context, myBlob: any): Promise<void> {
context.log('Parse CV stub: blob length', myBlob?.length)
// TODO: call Azure Document Intelligence, normalize, write to DB
}

export default activity
