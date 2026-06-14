const LIBRARY_MATERIAL_FIELDS = `
  id
  title
  description
  kind
  tags
  level
  publisher
  schoolId
  createdById
  createdAt
  updatedAt
  coverAttachmentId
  coverDownloadPath
  assets {
    id
    role
    deliveryKind
    url
    label
    sortOrder
    fileAttachmentId
    fileName
    downloadPath
    previewDownloadPath
  }
`;

export const LIBRARY_MATERIALS = `
  query LibraryMaterials($input: LibraryMaterialsQueryInput) {
    libraryMaterials(input: $input) {
      nextCursor
      kindCounts { all board presentation book other }
      items { ${LIBRARY_MATERIAL_FIELDS} }
    }
  }
`;

export const LIBRARY_MATERIAL = `
  query LibraryMaterial($id: ID!) {
    libraryMaterial(id: $id) {
      ${LIBRARY_MATERIAL_FIELDS}
    }
  }
`;

export const CREATE_LIBRARY_MATERIAL = `
  mutation CreateLibraryMaterial($input: CreateLibraryMaterialInput!) {
    createLibraryMaterial(input: $input) {
      ${LIBRARY_MATERIAL_FIELDS}
    }
  }
`;

export const UPDATE_LIBRARY_MATERIAL = `
  mutation UpdateLibraryMaterial($id: ID!, $input: UpdateLibraryMaterialInput!) {
    updateLibraryMaterial(id: $id, input: $input) {
      ${LIBRARY_MATERIAL_FIELDS}
    }
  }
`;

export const DELETE_LIBRARY_MATERIAL = `
  mutation DeleteLibraryMaterial($id: ID!) {
    deleteLibraryMaterial(id: $id)
  }
`;
