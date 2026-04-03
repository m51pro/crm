import { contextBridge } from "electron";

const apiUrlArg = process.argv.find(arg => arg.startsWith('--api-url='));
const apiUrl = apiUrlArg ? apiUrlArg.split('=')[1] : null;

contextBridge.exposeInMainWorld("desktopApp", {
  platform: process.platform,
  apiUrl: apiUrl,
});
