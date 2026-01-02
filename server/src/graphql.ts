import { InventoryResolver } from "./resolvers/InventoryResolver";
import { ManufacturerResolver } from "./resolvers/ManufacturerResolver";
import { ScaleResolver } from "./resolvers/ScaleResolver";
import { AcquiredSourceResolver } from "./resolvers/AcquiredSourceResolver";
import { BackgroundResolver } from "./resolvers/BackgroundResolver";
import { StorageLocationResolver } from "./resolvers/StorageLocationResolver";
import { CategoryResolver } from "./resolvers/CategoryResolver";

export const resolvers = [InventoryResolver, ManufacturerResolver, ScaleResolver, AcquiredSourceResolver, BackgroundResolver, StorageLocationResolver, CategoryResolver];
