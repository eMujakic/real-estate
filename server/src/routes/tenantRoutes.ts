import express from "express";
import {
    getTenant,
    createTenant,
    updateTenant,
    getTenantProperties,
    addFavoriteProperty,
    removeFavoriteProperty
} from "../controllers/tenantControllers";

const router = express.Router();

router.get("/:cognitoId", getTenant);
router.put("/:cognitoId", updateTenant);
router.get("/:cognitoId/current-residences", getTenantProperties)
router.post("/:cognitoId/favorites/:propertyId", addFavoriteProperty)
router.delete("/:cognitoId/favorites/:propertyId", removeFavoriteProperty)
router.post("/", createTenant);



export default router;