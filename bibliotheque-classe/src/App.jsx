import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

function App() {
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem('libraryBooks')
    return saved ? JSON.parse(saved) : []
  })
  
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('libraryStudents')
    return saved ? JSON.parse(saved) : []
  })
  
  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('libraryLoans')
    return saved ? JSON.parse(saved) : []
  })
  
  const [activeTab, setActiveTab] = useState('books')
  const [searchTerm, setSearchTerm] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scanMode, setScanMode] = useState('add-book')
  
  const [newBook, setNewBook] = useState({
    barcode: '',
    title: '',
    author: '',
    coverUrl: ''
  })
  
  const [selectedStudent, setSelectedStudent] = useState('')
  const [studentName, setStudentName] = useState('')
  
  useEffect(() => {
    localStorage.setItem('libraryBooks', JSON.stringify(books))
  }, [books])
  
  useEffect(() => {
    localStorage.setItem('libraryStudents', JSON.stringify(students))
  }, [students])
  
  useEffect(() => {
    localStorage.setItem('libraryLoans', JSON.stringify(loans))
  }, [loans])
  
  const fetchBookCover = async (isbn) => {
    try {
      const cleanIsbn = isbn.replace(/[-\s]/g, '')
      const response = await fetch(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.json`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.key) {
          return `https://covers.openlibrary.org/b/${data.key}-L.jpg`
        }
      }
      return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`
    } catch (error) {
      console.error('Erreur couverture:', error)
      return ''
    }
  }
  
  const fetchBookCoverGoogle = async (isbn) => {
    try {
      const cleanIsbn = isbn.replace(/[-\s]/g, '')
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`)
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        const bookInfo = data.items[0].volumeInfo
        const coverUrl = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || ''
        if (!newBook.title && bookInfo.title) {
          setNewBook(prev => ({ ...prev, title: bookInfo.title }))
        }
        if (!newBook.author && bookInfo.authors) {
          setNewBook(prev => ({ ...prev, author: bookInfo.authors.join(', ') }))
        }
        return coverUrl
      }
      return ''
    } catch (error) {
      console.error('Erreur Google Books:', error)
      return ''
    }
  }
  
  const addBook = async () => {
    if (!newBook.barcode.trim()) {
      alert('Veuillez entrer un code-barres')
      return
    }
    if (books.find(b => b.barcode === newBook.barcode)) {
      alert('Ce livre existe déjà')
      return
    }
    let coverUrl = newBook.coverUrl
    if (!coverUrl && newBook.barcode) {
      coverUrl = await fetchBookCover(newBook.barcode)
      if (!coverUrl) coverUrl = await fetchBookCoverGoogle(newBook.barcode)
    }
    const book = {
      id: uuidv4(),
      barcode: newBook.barcode,
      title: newBook.title || 'Titre inconnu',
      author: newBook.author || 'Auteur inconnu',
      coverUrl: coverUrl || 'https://via.placeholder.com/128x192?text=Pas+de+couverture',
      available: true,
      addedDate: new Date().toISOString()
    }
    setBooks(prev => [...prev, book])
    setNewBook({ barcode: '', title: '', author: '', coverUrl: '' })
    alert('Livre ajouté avec succès!')
  }
  
  const addStudent = () => {
    if (!studentName.trim()) {
      alert('Veuillez entrer un nom')
      return
    }
    const student = { id: uuidv4(), name: studentName.trim(), addedDate: new Date().toISOString() }
    setStudents(prev => [...prev, student])
    setStudentName('')
    alert('Élève ajouté!')
  }
  
  const borrowBook = (bookId) => {
    if (!selectedStudent) {
      alert('Sélectionnez un élève')
      return
    }
    const loan = { id: uuidv4(), bookId, studentId: selectedStudent, borrowDate: new Date().toISOString(), returnDate: null }
    setLoans(prev => [...prev, loan])
    setBooks(prev => prev.map(book => book.id === bookId ? { ...book, available: false } : book))
    alert('Livre emprunté!')
  }
  
  const returnBook = (bookId) => {
    setLoans(prev => prev.map(loan => loan.bookId === bookId && !loan.returnDate ? { ...loan, returnDate: new Date().toISOString() } : loan))
    setBooks(prev => prev.map(book => book.id === bookId ? { ...book, available: true } : book))
    alert('Livre retourné!')
  }
  
  useEffect(() => {
    let scanner = null
    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, false)
      scanner.render(
        (decodedText) => {
          if (scanMode === 'add-book') {
            setNewBook(prev => ({ ...prev, barcode: decodedText }))
            setShowScanner(false)
            fetchBookCover(decodedText)
            fetchBookCoverGoogle(decodedText)
          } else if (scanMode === 'borrow-return') {
            const book = books.find(b => b.barcode === decodedText)
            if (book) {
              if (book.available) borrowBook(book.id)
              else returnBook(book.id)
            } else {
              alert('Livre non trouvé')
            }
            setShowScanner(false)
          }
        },
        (error) => console.warn('Erreur scan:', error)
      )
    }
    return () => { if (scanner) scanner.clear().catch(err => console.error(err)) }
  }, [showScanner, scanMode])
  
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.barcode.includes(searchTerm)
  )
  
  const borrowedBooks = loans.filter(loan => !loan.returnDate).map(loan => ({
    ...loan,
    book: books.find(b => b.id === loan.bookId),
    student: students.find(s => s.id === loan.studentId)
  }))
  
  return (
    <div className="app">
      <header className="header">
        <h1>📚 Bibliothèque de Classe</h1>
        <nav className="nav">
          <button className={activeTab === 'books' ? 'active' : ''} onClick={() => setActiveTab('books')}>📖 Livres</button>
          <button className={activeTab === 'borrow' ? 'active' : ''} onClick={() => setActiveTab('borrow')}>📋 Emprunts</button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>👥 Élèves</button>
        </nav>
      </header>
      <main className="main">
        {activeTab === 'books' && (
          <div className="tab-content">
            <h2>Gestion des Livres</h2>
            <div className="add-book-form">
              <h3>Ajouter un livre</h3>
              <div className="form-row">
                <input type="text" placeholder="Code-barres (ISBN)" value={newBook.barcode} onChange={(e) => setNewBook(prev => ({ ...prev, barcode: e.target.value }))} className="input-field" />
                <button onClick={() => { setScanMode('add-book'); setShowScanner(!showScanner) }} className="btn-scan">📷 Scanner</button>
              </div>
              {showScanner && <div id="reader" className="scanner-container"></div>}
              <div className="form-row">
                <input type="text" placeholder="Titre" value={newBook.title} onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))} className="input-field" />
                <input type="text" placeholder="Auteur" value={newBook.author} onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))} className="input-field" />
              </div>
              <div className="form-row">
                <input type="text" placeholder="URL couverture (optionnel)" value={newBook.coverUrl} onChange={(e) => setNewBook(prev => ({ ...prev, coverUrl: e.target.value }))} className="input-field full-width" />
              </div>
              {newBook.coverUrl && <div className="preview-cover"><img src={newBook.coverUrl} alt="Aperçu" /></div>}
              <button onClick={addBook} className="btn-add">➕ Ajouter</button>
            </div>
            <div className="search-section">
              <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
            </div>
            <div className="books-grid">
              {filteredBooks.length === 0 ? <p className="no-books">Aucun livre</p> : filteredBooks.map(book => (
                <div key={book.id} className={`book-card ${!book.available ? 'borrowed' : ''}`}>
                  <img src={book.coverUrl} alt={book.title} className="book-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/128x192?text=Pas+de+couverture'} />
                  <div className="book-info">
                    <h4>{book.title}</h4>
                    <p className="author">{book.author}</p>
                    <p className="barcode">Code: {book.barcode}</p>
                    <span className={`status ${book.available ? 'available' : 'unavailable'}`}>{book.available ? '✅ Disponible' : '📗 Emprunté'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'borrow' && (
          <div className="tab-content">
            <h2>Gestion des Emprunts</h2>
            <div className="quick-action">
              <h3>Action rapide</h3>
              <button onClick={() => { setScanMode('borrow-return'); setShowScanner(!showScanner) }} className="btn-scan-large">📷 Scanner pour emprunter/retourner</button>
              {showScanner && scanMode === 'borrow-return' && <div id="reader" className="scanner-container"></div>}
            </div>
            <div className="current-loans">
              <h3>Livres empruntés ({borrowedBooks.length})</h3>
              {borrowedBooks.length === 0 ? <p className="no-loans">Aucun livre emprunté</p> : (
                <table className="loans-table">
                  <thead><tr><th>Couverture</th><th>Titre</th><th>Élève</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {borrowedBooks.map(loan => (
                      <tr key={loan.id}>
                        <td><img src={loan.book?.coverUrl || 'https://via.placeholder.com/50x75'} alt="" className="mini-cover" /></td>
                        <td>{loan.book?.title || 'Inconnu'}</td>
                        <td>{loan.student?.name || 'Inconnu'}</td>
                        <td>{new Date(loan.borrowDate).toLocaleDateString('fr-FR')}</td>
                        <td><button onClick={() => returnBook(loan.bookId)} className="btn-return">✅ Retourner</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {activeTab === 'students' && (
          <div className="tab-content">
            <h2>Gestion des Élèves</h2>
            <div className="add-student-form">
              <h3>Ajouter un élève</h3>
              <div className="form-row">
                <input type="text" placeholder="Nom de l'élève" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="input-field" onKeyPress={(e) => e.key === 'Enter' && addStudent()} />
                <button onClick={addStudent} className="btn-add">➕ Ajouter</button>
              </div>
            </div>
            <div className="students-list">
              <h3>Liste des élèves ({students.length})</h3>
              {students.length === 0 ? <p className="no-students">Aucun élève</p> : (
                <ul className="students-ul">
                  {students.map(student => {
                    const activeLoans = loans.filter(l => l.studentId === student.id && !l.returnDate)
                    return (<li key={student.id} className="student-item"><span className="student-name">{student.name}</span><span className="student-loans">{activeLoans.length} livre(s)</span></li>)
                  })}
                </ul>
              )}
            </div>
            <div className="borrow-section">
              <h3>Sélectionner un élève</h3>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="student-select">
                <option value="">-- Choisir --</option>
                {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </main>
      <footer className="footer"><p>📚 Données sauvegardées localement</p></footer>
    </div>
  )
}

export default App
