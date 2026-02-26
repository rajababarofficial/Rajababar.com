"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Download, Share2 } from "lucide-react";
import { motion } from "motion/react";

interface Book {
  id: string;
  title_en: string;
  title_sd: string;
  author_en: string;
  author_sd: string;
  year: string;
  publisher: string;
  category: string;
  language: string;
  link: string;
  thumbnail: string;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [view, setView] = useState<"card" | "list">("card");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const booksPerPage = 15;

  // Load CSV
  useEffect(() => {
    Papa.parse("/lib.sindh.org/lib.sindh.org-BookList-Feb-26-2026 09.15.25.csv", {
      header: true,
      download: true,
      complete: (results) => {
        const data = results.data.map((row: any, i: number) => ({
          id: (i + 1).toString(),
          title_en: row["Title (English)"],
          title_sd: row["Title (Sindhi)"],
          author_en: row["Author (English)"],
          author_sd: row["Author (Sindhi)"],
          year: row["Year"],
          publisher: row["Publisher"],
          category: row["Category"],
          language: row["Language"],
          link: row["Link"],
          thumbnail: row["Thumbnail"]
        }));
        setBooks(data);
        setFilteredBooks(data);
      }
    });
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter books
  useEffect(() => {
    let filtered = books.filter(book =>
      (book.title_en.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
       book.title_sd.toLowerCase().includes(debouncedSearch.toLowerCase())) &&
      (categoryFilter === "All" || book.category === categoryFilter)
    );
    setFilteredBooks(filtered);
    setCurrentPage(1); // reset to first page on filter
  }, [debouncedSearch, categoryFilter, books]);

  const categories = ["All", ...Array.from(new Set(books.map(b => b.category)))];

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const displayedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">All books are from lib.sindh.org</h1>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full sm:w-1/3"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full sm:w-1/4"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 border rounded ${view==="card" ? "bg-blue-600 text-white" : ""}`}
            onClick={() => setView("card")}
          >
            Card View
          </button>
          <button
            className={`px-4 py-2 border rounded ${view==="list" ? "bg-blue-600 text-white" : ""}`}
            onClick={() => setView("list")}
          >
            List View
          </button>
        </div>
      </div>

      {/* Card View */}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayedBooks.map(book => (
            <motion.div key={book.id} layout className="bg-white shadow-md rounded-lg overflow-hidden">
              <img src={book.thumbnail} alt={book.title_en} loading="lazy" className="w-full h-48 object-cover"/>
              <div className="p-4">
                <h2 className={`${book.language==="Sindhi" ? "font-sindhi" : book.language==="Urdu" ? "font-urdu" : "font-sans"} font-bold text-lg`}>
                  {book.language==="Sindhi" ? book.title_sd : book.title_en}
                </h2>
                <p className={`${book.language==="Sindhi" ? "font-sindhi" : book.language==="Urdu" ? "font-urdu" : ""}`}>
                  {book.language==="Sindhi" ? book.author_sd : book.author_en}
                </p>
                <p className="text-sm text-gray-500">{book.year}</p>
                <p className="text-sm text-gray-500">{book.publisher}</p>
                <p className="text-sm text-gray-500">{book.language}</p>
                <div className="mt-2 flex gap-2">
                  <a href={book.link} target="_blank" className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center justify-center gap-1"><Download className="w-3 h-3"/>Download</a>
                  <button className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center justify-center gap-1"><Share2 className="w-3 h-3"/>Share</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Author</th>
                <th className="p-2 border">Year</th>
                <th className="p-2 border">Publisher</th>
                <th className="p-2 border">Language</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedBooks.map(book => (
                <tr key={book.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className={`${book.language==="Sindhi" ? "font-sindhi" : book.language==="Urdu" ? "font-urdu" : ""} p-2 border`}>
                    {book.language==="Sindhi" ? book.title_sd : book.title_en}
                  </td>
                  <td className={`${book.language==="Sindhi" ? "font-sindhi" : book.language==="Urdu" ? "font-urdu" : ""} p-2 border`}>
                    {book.language==="Sindhi" ? book.author_sd : book.author_en}
                  </td>
                  <td className="p-2 border">{book.year}</td>
                  <td className="p-2 border">{book.publisher}</td>
                  <td className="p-2 border">{book.language}</td>
                  <td className="p-2 border flex gap-2">
                    <a href={book.link} target="_blank" className="px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center justify-center gap-1"><Download className="w-3 h-3"/>Download</a>
                    <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center justify-center gap-1"><Share2 className="w-3 h-3"/>Share</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1 border rounded">{currentPage} / {totalPages}</span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

    </div>
  );
}