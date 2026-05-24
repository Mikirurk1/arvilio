import {
  filterSafeFiles,
  formatMessage,
  getFilePlaceholder,
  isImageFileName,
  MAX_FILE_SIZE_MB,
  openLessonAttachment,
} from './fileUtils';

describe('fileUtils', () => {
  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
  });

  it('formatMessage substitutes placeholders', () => {
    expect(formatMessage('Hello {name}, size {size}MB', { name: 'World', size: 5 })).toBe(
      'Hello World, size 5MB',
    );
  });

  it('exports max file size', () => {
    expect(MAX_FILE_SIZE_MB).toBe(5);
  });

  it('isImageFileName detects images', () => {
    expect(isImageFileName('photo.png')).toBe(true);
    expect(isImageFileName('doc.pdf')).toBe(false);
  });

  it('getFilePlaceholder maps extensions', () => {
    expect(getFilePlaceholder('x.pdf')).toBe('PDF');
    expect(getFilePlaceholder('x.jpg')).toBe('IMG');
    expect(getFilePlaceholder('x.unknown')).toBe('FILE');
  });

  it('openLessonAttachment calls image preview for images', () => {
    const onImagePreview = jest.fn();
    openLessonAttachment('a.png', 'blob:url', onImagePreview);
    expect(onImagePreview).toHaveBeenCalledWith('blob:url');
  });

  it('openLessonAttachment no-ops without url', () => {
    const onImagePreview = jest.fn();
    openLessonAttachment('a.png', null, onImagePreview);
    expect(onImagePreview).not.toHaveBeenCalled();
  });

  it('filterSafeFiles accepts pdf and rejects oversize', () => {
    const good = new File(['x'], 'notes.pdf', { type: 'application/pdf' });
    const huge = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    });
    const bad = new File(['x'], 'virus.exe', { type: 'application/octet-stream' });
    const list = {
      length: 3,
      item: (i: number) => [good, huge, bad][i] ?? null,
      [Symbol.iterator]: function* () {
        yield good;
        yield huge;
        yield bad;
      },
    } as FileList;

    const { safe, rejected } = filterSafeFiles(list);
    expect(safe).toHaveLength(1);
    expect(safe[0]?.name).toBe('notes.pdf');
    expect(rejected).toEqual(expect.arrayContaining(['big.pdf', 'virus.exe']));
  });

  it('filterSafeFiles returns empty for null input', () => {
    expect(filterSafeFiles(null)).toEqual({ safe: [], rejected: [], maxFileSizeMb: MAX_FILE_SIZE_MB });
  });

  it('filterSafeFiles accepts files by mime when extension missing', () => {
    const file = new File(['x'], 'scan', { type: 'image/png' });
    const list = {
      length: 1,
      item: () => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as FileList;
    const { safe, rejected } = filterSafeFiles(list);
    expect(safe).toHaveLength(1);
    expect(rejected).toHaveLength(0);
  });

  it('filterSafeFiles sanitizes unsafe characters in file names', () => {
    const file = new File(['x'], 'bad name!@#.pdf', { type: 'application/pdf' });
    const list = {
      length: 1,
      item: () => file,
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as FileList;
    expect(filterSafeFiles(list).safe[0]?.name).toBe('bad name___.pdf');
  });

  it('getFilePlaceholder maps office formats', () => {
    expect(getFilePlaceholder('slides.pptx')).toBe('PPT');
    expect(getFilePlaceholder('sheet.xls')).toBe('XLS');
    expect(getFilePlaceholder('notes.doc')).toBe('DOC');
  });

  it('openLessonAttachment downloads non-image files', () => {
    const click = jest.fn();
    const appendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const remove = jest.spyOn(HTMLElement.prototype, 'remove').mockImplementation(() => undefined);
    const createElement = jest.spyOn(document, 'createElement').mockImplementation(() => {
      return {
        href: '',
        download: '',
        target: '',
        rel: '',
        click,
        remove: jest.fn(),
      } as unknown as HTMLAnchorElement;
    });

    const onImagePreview = jest.fn();
    openLessonAttachment('att:uuid:abc', 'blob:file', onImagePreview);
    expect(onImagePreview).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalled();

    createElement.mockRestore();
    appendChild.mockRestore();
    remove.mockRestore();
  });
});
