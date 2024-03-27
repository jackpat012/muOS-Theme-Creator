import JSZip from "jszip";
import { selectedTheme } from "@/service/theme";
import { TEXT_CREDIT, TEXT_SCHEME } from "@/service/text";

/**
 * Generate a zipped theme
 * file list:
 * 
 * credits.txt
 * - font
 * - image
 *     bootlogo.bmp
 *     - footer
 *         default.png
 *     - header
 *         default.png
 *     - wall
 *         default.png
 *         muxcharge.png
 *         muxconfig.png
 *         muxcredits.png
 *         muxfavourite.png
 *         muxhistory.png
 *         muxinfo.png
 *         muxlaunch.png
 *         muxplore.png
 *         muxreset.png
 *         muxtheme.png
 *         muxassign.png
 *         muxdevice.png
 *         muxnetwork.png
 *         muxrtc.png
 *         muxstart.png
 *         muxsysinfo.png
 *         muxtester.png
 *         muxtimezone.png
 *         muxtracker.png
 *         muxtweakadv.png
 *         muxtweakgen.png
 *         muxwebserv.png
 * - music
 * - scheme
 *     default.txt
 * - sound
 */
export type MUOSThemeFolderStructure = {
    zip: JSZip,
    folder: JSZip,
    child:{
        font: { folder: JSZip },
        image: {
            folder: JSZip,
            child: {
                footer: { folder: JSZip },
                header: { folder: JSZip },
                wall: { folder: JSZip },
            }
        },
        music: { folder: JSZip },
        sound: { folder: JSZip },
        scheme: { folder: JSZip },
    },
    get: (folderPath: string[]) => JSZip,
}
export const initFolderStructure = (): MUOSThemeFolderStructure | null => {
    try{
        const zip = new JSZip();
        const rootFolder = zip.folder(selectedTheme.value.zipName);
        if(!rootFolder) throw "ERROR NULL";
        // Creates all neccesary folders
        const font = rootFolder.folder("font");
        const image = rootFolder.folder("image");
        const music = rootFolder.folder("music");
        const scheme = rootFolder.folder("scheme");
        const sound = rootFolder.folder("sound");
        if(!font || !image || !music || !scheme || !sound) throw "ERROR NULL";
        const footer = image.folder("footer");
        const header = image.folder("header");
        const wall = image.folder("wall");
        if(!footer || !header || !wall) throw "ERROR NULL";
        return {
            zip: zip,
            folder: rootFolder,
            child:{
                font: { folder: font },
                image: {
                    folder: image,
                    child: {
                        footer: { folder: footer },
                        header: { folder: header },
                        wall: { folder: wall },
                    }
                },
                music: { folder: music },
                sound: { folder: sound },
                scheme: { folder: scheme },
            },
            get(folderPath: string[]){
                if(folderPath.length === 0) return rootFolder;
                let currentRoot = this as any;
                for(let i = 0; i < folderPath.length; i++){
                    const _folder = folderPath[i];
                    const tree = currentRoot.child as any;
                    if(!tree[_folder]) return currentRoot.folder;
                    currentRoot = tree[_folder];
                }
                return currentRoot.folder;
            }
        }   
    }catch(err){
        console.log(err);
        return null;
    }
}
export const generateZipTheme = () => {
    try{

        const folders = initFolderStructure();
        if(!folders) throw "ERROR NULL";
        folders.get([]).file("credits.txt", TEXT_CREDIT(selectedTheme.value.author));    
        folders.get(["scheme"]).file("default.txt", TEXT_SCHEME(selectedTheme.value.values));

        // Process images
        const imagesGroup = selectedTheme.value.values.find(group => group.label === "images");
        if(imagesGroup){
            for(let i = 0; i < imagesGroup.child.length; i++){
                const child = imagesGroup.child[i];
                if(
                    !child.value || !child.folderPath ||
                    child.value.length === 0 
                ) continue;
                const extendedFilename = `${child.property}${child.format}`;
                if(child.folderPath.length === 0){
                    folders.get([]).file(extendedFilename, child.value[0]);
                    continue;
                }
                folders.get(child.folderPath).file(extendedFilename, child.value[0]);
            }
        }
        
        folders.zip.generateAsync({type:"blob"})
        .then(function(content) {
            promptDownload(content, `${selectedTheme.value.zipName}.zip`)
        });
    }catch(err){
        console.log(err)
    }
}
/*
const img = zip.folder("images");
img.file("smile.gif", imgData, {base64: true});
*/
export const promptDownload = (fileData: Blob, filename: string) => {
    const blob = new Blob([fileData]);
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;        
    elem.target = "_blank";
    document.body.appendChild(elem);
    elem.click();        
    document.body.removeChild(elem);
}


/**
  // Function to load a font file
  function loadFontsFile(url) {
    if (!url) {
      return Promise.reject("Font URL is undefined.");
    }
  
    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .catch(function (error) {
        console.error("Error loading font file:", error);
        displayErrorMessage('Error loading font file: ' + error.message);
        throw error; // Propagate the error to the next catch block
      });
  }

  // Function to load and add user-uploaded font files to the zip folder
  function addUserFontFilesToZip(file, filename, folder) {
    return new Promise(function (resolve, reject) {
      if (file.size <= 200 * 1024) {
        var reader = new FileReader();
        reader.onload = function (event) {
          if (folder) {
            // Do not include "font/" in the file path
            folder.file(filename, event.target.result, { binary: true });
            resolve();
          } else {
            reject(new Error("Folder is not defined."));
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        var errorMessage = "File '" + file.name + "' uploaded for '" + filename + "' exceeds 200KB limit.";
        reject(errorMessage);
        displayErrorMessage(errorMessage);
      }
    });
  }
  // Function to load and add user-uploaded sound files to the zip folder
  function addUserSoundFilesToZip(file, filename, folder) {
    return new Promise(function (resolve, reject) {
      if (file.size <= 200 * 1024) { // Check if file size is less than or equal to 200KB
        var reader = new FileReader();
        reader.onload = function (event) {
          folder.file(filename, event.target.result, { binary: true });
          resolve();
        };
        reader.readAsArrayBuffer(file);
      } else {
        var errorMessage = "File '" + file.name + "' uploaded for '" + filename + "' exceeds 200KB limit.";
        reject(errorMessage);
        displayErrorMessage(errorMessage);
      }
    });
  }

  // Function to load and add user-uploaded sound files to the zip folder
  function addUserMusicFilesToZip(file, filename, folder) {
    return new Promise(function (resolve, reject) {
      if (file.size <= 2 * 1024 * 1024) { // Check if file size is less than or equal to 2MB
        var reader = new FileReader();
        reader.onload = function (event) {
          folder.file(filename, event.target.result, { binary: true });
          resolve();
        };
        reader.readAsArrayBuffer(file);
      } else {
        var errorMessage = "File '" + file.name + "' uploaded for '" + filename + "' exceeds 200KB limit.";
        reject(errorMessage);
        displayErrorMessage(errorMessage);
      }
    });
  }
 */