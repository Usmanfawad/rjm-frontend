/**
 * Integration Test: Document Upload Flow
 * Tests document upload, processing, and status tracking
 */
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import userEvent from '@testing-library/user-event'
import { api } from '@/lib/api'

jest.mock('@/lib/api')

const mockUploadDocument = api.uploadDocument as jest.Mock
const mockGetDocumentStatus = api.getDocumentStatus as jest.Mock
const mockGetDocument = api.getDocument as jest.Mock
const mockOnUploadComplete = jest.fn()

describe('Document Upload Flow Integration', () => {
  beforeEach(() => {
    mockUploadDocument.mockClear()
    mockGetDocumentStatus.mockClear()
    mockGetDocument.mockClear()
    mockOnUploadComplete.mockClear()
  })

  it('completes full document upload flow', async () => {
    const user = userEvent.setup()
    
    // Create a mock file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    const mockDocument = {
      id: 'doc-1',
      title: 'test',
      filename: 'test.pdf',
      file_type: 'application/pdf',
      file_size: 1024,
      status: 'processing' as const,
      chunk_count: 0,
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    const mockCompletedDocument = {
      ...mockDocument,
      status: 'completed' as const,
      chunk_count: 10,
    }

    mockUploadDocument.mockResolvedValue({
      success: true,
      data: mockDocument,
    })

    mockGetDocumentStatus
      .mockResolvedValueOnce({
        success: true,
        data: { id: 'doc-1', status: 'processing' as const, chunk_count: 0 },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { id: 'doc-1', status: 'completed' as const, chunk_count: 10 },
      })

    mockGetDocument.mockResolvedValue({
      success: true,
      data: mockCompletedDocument,
    })

    render(<DocumentUpload onUploadComplete={mockOnUploadComplete} />)

    // Step 1: User sees upload form - use getAllByText since "Upload Document" appears in title and button
    const uploadTexts = screen.getAllByText(/upload document/i)
    expect(uploadTexts.length).toBeGreaterThan(0)

    // Step 2: User selects file - use getByRole to find the file input more reliably
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    await user.upload(fileInput, file)

    // Step 3: User enters title
    await user.type(screen.getByPlaceholderText(/document title/i), 'Test Document')

    // Step 4: User clicks upload
    await user.click(screen.getByRole('button', { name: /upload document/i }))

    // Step 5: Upload API is called
    await waitFor(() => {
      expect(mockUploadDocument).toHaveBeenCalled()
    })

    // Step 6: Processing state is shown
    await waitFor(() => {
      expect(screen.getByText(/processing your document/i)).toBeInTheDocument()
    })

    // Step 7: Status polling occurs
    await waitFor(() => {
      expect(mockGetDocumentStatus).toHaveBeenCalled()
    }, { timeout: 3000 })

    // Step 8: Success message with RJM Voice
    await waitFor(() => {
      expect(screen.getByText(/document uploaded and processing/i)).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('validates file type', async () => {
    const user = userEvent.setup()
    const invalidFile = new File(['content'], 'test.exe', { type: 'application/x-msdownload' })

    render(<DocumentUpload />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    
    // Create a file change event
    const fileList = {
      0: invalidFile,
      length: 1,
      item: (index: number) => (index === 0 ? invalidFile : null),
      [Symbol.iterator]: function* () {
        yield invalidFile
      },
    } as FileList
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
    })
    
    await user.upload(fileInput, invalidFile)

    await waitFor(() => {
      expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    expect(mockUploadDocument).not.toHaveBeenCalled()
  })

  it('validates file size', async () => {
    const user = userEvent.setup()
    // Create a file larger than 25MB
    const largeFile = new File([new ArrayBuffer(26 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })

    render(<DocumentUpload />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    
    const fileList = {
      0: largeFile,
      length: 1,
      item: (index: number) => (index === 0 ? largeFile : null),
      [Symbol.iterator]: function* () {
        yield largeFile
      },
    } as FileList
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
    })
    
    await user.upload(fileInput, largeFile)

    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    expect(mockUploadDocument).not.toHaveBeenCalled()
  })

  it('shows error on upload failure', async () => {
    const user = userEvent.setup()
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

    mockUploadDocument.mockResolvedValue({
      success: false,
      error: 'Upload failed',
    })

    render(<DocumentUpload />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file
      },
    } as FileList
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList,
      writable: false,
    })
    
    await user.upload(fileInput, file)
    await user.type(screen.getByPlaceholderText(/document title/i), 'Test')
    await user.click(screen.getByRole('button', { name: /upload document/i }))

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
    })
  })
})
