/* files data */
import path from "path";
const checkFile = async (path: string) => await window.api.files.check(path);

const copyFile = async (source: string, destination: string) =>
  await window.api.files.copy.file(source, destination);
const copyDirectory = async (source: string, destination: string) =>
  await window.api.files.copy.directory(source, destination);
const createDirectory = async (path: string) =>
  await window.api.files.create.directory(path);
const unzipFile = async (source: string, destination: string) =>
  await window.api.files.unzip.file(source, destination);
const runFileMacOS = async (filePath: string) =>
  await window.api.files.run.macos(filePath);
const runFileWindows = async (filePath: string) =>
  await window.api.files.run.windows(filePath);
const runFileLinux = async (filePath: string) =>
  await window.api.files.run.linux(filePath);

export const useFilesApiElectron = () => {
  return {
    checkFile,
    //getAllQuotations,
    createDirectory,
    copyFile,
    copyDirectory,
    unzipFile,
    runFileMacOS,
    runFileWindows,
    runFileLinux,
  };
};
