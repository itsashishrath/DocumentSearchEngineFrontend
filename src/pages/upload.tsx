import type React from "react"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { UploadIcon, File, X, Check, ArrowLeft, Loader2 } from "lucide-react"

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a PDF file",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a PDF file",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Create form data
    const formData = new FormData()
    formData.append("filename", selectedFile.name) // Add the filename field
    formData.append("file", selectedFile)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      const response = await fetch("http://127.0.0.1:8000/documents/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      toast({
        title: "Upload Successful",
        description: "Your document has been uploaded and processed",
      })

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
      })
    } finally {
      setTimeout(() => {
        setIsUploading(false)
      }, 1000)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-6">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>Upload a PDF document to add to your searchable collection</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <UploadIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Drag & drop your PDF file here</h3>
                      <p className="text-sm text-muted-foreground">or click to browse your files</p>
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Browse Files
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf"
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={clearSelectedFile} disabled={isUploading}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 ease-in-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  uploadProgress === 100 ? (
                    <div className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Upload Complete
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )
                ) : (
                  <div className="flex items-center">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Document
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
