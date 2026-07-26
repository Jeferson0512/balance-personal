import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui";
import { Upload, File, X } from "lucide-react";
import { avisoAtencion } from "../ui/dialogos.js";

export default function UploadFiles({ onFilesSelected, loading }) {
  const inputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-primary/5");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("border-primary", "bg-primary/5");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-primary/5");

    const files = Array.from(e.dataTransfer.files);
    procesarArchivos(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    procesarArchivos(files);
  };

  const procesarArchivos = (files) => {
    const validos = files.filter((file) => {
      const esExcel = file.type.includes("spreadsheet") || file.name.endsWith(".xlsx");
      const esPDF = file.type.includes("pdf") || file.name.endsWith(".pdf");
      return esExcel || esPDF;
    });

    if (validos.length === 0) {
      avisoAtencion("Formato no admitido", "Sube el Excel de YAPE (.xlsx) o el PDF de BCP.");
      return;
    }

    setSelectedFiles(validos);
  };

  const handleImportar = () => {
    if (selectedFiles.length === 0) {
      avisoAtencion("Ningún archivo seleccionado", "Arrastra un archivo o haz clic para elegirlo.");
      return;
    }

    onFilesSelected(selectedFiles);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Paso 1: Selecciona archivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <div className="text-sm font-medium">Arrastra archivos aquí o haz clic</div>
          <div className="text-xs text-muted-foreground mt-1">
            Excel de YAPE (.xlsx) y/o PDF de BCP
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".xlsx,.pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Archivos seleccionados:</div>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-primary" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 hover:bg-background rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Agregar más archivos
          </button>
          <button
            onClick={handleImportar}
            disabled={loading || selectedFiles.length === 0}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Analizar archivos"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
