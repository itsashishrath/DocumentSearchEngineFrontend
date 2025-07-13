"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Search, FileText, Upload, AlertCircle, Loader2, Download } from "lucide-react"

interface SearchResult {
  document_id: number
  filename: string
  matched_text: string
  score: number
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentDocuments, setRecentDocuments] = useState<SearchResult[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(true)
  const { toast } = useToast()

  // Fetch recent documents on component mount
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("http://localhost:8000/documents/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recent documents")
        }

        const data = await response.json()
        setRecentDocuments(data)
      } catch (error) {
        console.error("Error fetching recent documents:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your recent documents",
        })
      } finally {
        setIsLoadingRecent(false)
      }
    }

    fetchRecentDocuments()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      const response = await fetch(
        `http://localhost:8000/documents/search/?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data)

      if (data.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An error occurred during search",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const downloadDocument = async (documentId: number, filename: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      const response = await fetch(`http://localhost:8000/documents/${documentId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download document")
      }

      // Create a blob from the PDF data
      const blob = await response.blob()

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: `Downloading ${filename}`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An error occurred during download",
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-6 space-y-8">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Smart Document Search</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Search through your documents with our powerful BM25 search engine
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto mb-8 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search your documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Search Results</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result) => (
                <Card key={result.document_id} className="document-card overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-purple-500" />
                      {result.filename}
                    </CardTitle>
                    <CardDescription>Score: {result.score.toFixed(2)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground line-clamp-3">{result.matched_text}</div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadDocument(result.document_id, result.filename)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Documents</h2>
            <Button variant="outline" asChild>
              <Link to="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </Link>
            </Button>
          </div>

          {isLoadingRecent ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentDocuments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentDocuments.map((doc) => (
                <Card key={doc.document_id} className="document-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-purple-500" />
                      {doc.filename}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {doc.matched_text || "Document content preview not available"}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadDocument(doc.document_id, doc.filename)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-4">Upload your first document to get started with SmartSearch</p>
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
