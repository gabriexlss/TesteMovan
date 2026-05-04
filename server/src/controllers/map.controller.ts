import { Response,Request } from "express";
import * as z from 'zod';

const addressToCoordinates = async (req: Request, res: Response) => {
    const addressSchema: z.ZodString = z.string().min(2).max(200);
    const addressBody = req.body.address; // Substitua por req.body.address para uso real

    try {
        const validatedAddress: string = encodeURIComponent(addressSchema.parse(addressBody));
        const resp = await fetch(
            `https://geocode.googleapis.com/v4/geocode/address/${validatedAddress}?key=${process.env["GOOGLEMAPS_API_KEY"]}`
        );

        if (!resp.ok) {
            return res.status(resp.status).json({ error: "Geocode request failed" });
        }

        const data = await resp.json();
        const location = data?.results?.[0]?.location;
        const latitude = location?.latitude;
        const longitude = location?.longitude;
        if (!location) {
            return res.status(404).json({ error: "Location not found" });
        }

        return res.status(200).json({ latitude, longitude });
    } catch (e) {
        return res.status(400).json({ error: "Invalid address" });
    }
};
export default addressToCoordinates;