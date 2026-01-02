export const GET_SCALES = gql`
  query UniqueScales {
    uniqueScales
  }
`;
import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query GetItems {
    inventoryItems {
      id
      image
      description
      category
      scale
      manufacturer
      modelFirstYear
      modelNumber
      acquiredFrom
      acquiredDate
      condition
      collectionName
      storageLocation
      variation
      originalBox
      created_timestamp
      updated_timestamp
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($input: InventoryInput!) {
    createInventoryItem(input: $input) {
      id
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem($id: ID!, $input: InventoryInput!) {
    updateInventoryItem(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($id: ID!) {
    deleteInventoryItem(id: $id)
  }
`;

export const GET_BACKGROUND = gql`
  query GetBackground {
    background {
      id
      image
    }
  }
`;

export const SET_BACKGROUND = gql`
  mutation SetBackground($image: String!) {
    setBackground(image: $image) {
      id
      image
    }
  }
`;

export const GET_MANUFACTURER_NAMES = gql`
  query AllManufacturerNames {
    allManufacturerNames
  }
`;

export const GET_MANUFACTURERS = gql`
  query AllManufacturers {
    manufacturers: allManufacturers {
      name
      description
      yearIncorporated
      defunct
    }
  }
`;

export const CREATE_MANUFACTURER = gql`
  mutation CreateManufacturer($input: ManufacturerInput!) {
    upsertManufacturer(input: $input) {
      name
      description
      yearIncorporated
      defunct
    }
  }
`;

export const UPDATE_MANUFACTURER = gql`
  mutation UpdateManufacturer($input: ManufacturerInput!) {
    upsertManufacturer(input: $input) {
      name
      description
      yearIncorporated
      defunct
    }
  }
`;

export const DELETE_MANUFACTURER = gql`
  mutation DeleteManufacturer($name: String!) {
    deleteManufacturer(name: $name)
  }
`;

export const GET_SOURCE_NAMES = gql`
  query AllSourceNames {
    allSourceNames
  }
`;

export const GET_STORAGE_LOCATION_NAMES = gql`
  query AllStorageLocationNames {
    allStorageLocationNames
  }
`;

export const GET_CATEGORY_NAMES = gql`
  query AllCategoryNames {
    allCategoryNames
  }
`;

export const UPSERT_CATEGORY = gql`
  mutation UpsertCategory($input: CategoryInput!) {
    upsertCategory(input: $input) {
      name
      description
    }
  }
`;

export const UPSERT_SCALE = gql`
  mutation UpsertScale($input: ScaleInput!) {
    upsertScale(input: $input) {
      scale
      description
    }
  }
`;

export const UPSERT_SOURCE = gql`
  mutation UpsertSource($input: SourceInput!) {
    upsertSource(input: $input) {
      name
      description
    }
  }
`;

export const UPSERT_STORAGE_LOCATION = gql`
  mutation UpsertStorageLocation($input: StorageLocationInput!) {
    upsertStorageLocation(input: $input) {
      name
      description
    }
  }
`;
