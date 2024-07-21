import Jimp from 'jimp';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/prismaClientProvider';

function rgbToHex(rgb: { r: number, g: number, b: number, a?: number }) {
    let r = rgb.r.toString(16);
    let g = rgb.g.toString(16);
    let b = rgb.b.toString(16);

    if (r.length == 1)
        r = '0' + r;
    if (g.length == 1)
        g = '0' + g;
    if (b.length == 1)
        b = '0' + b;

    return '#' + r + g + b;
}

function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}

export async function checkImageAvailability(url: string): Promise<boolean> {
    try {
        await Jimp.read(url);

        return true;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getAverageColor(url: string, global_url?: boolean): Promise<{
    color: string,
    luminance: number
}> {

    let thumbnailUrl = url;
    if (global_url) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
        const oembedResponse = await fetch(oembedUrl);
        const oembedJson = await oembedResponse.json();
        thumbnailUrl = oembedJson.thumbnail_url;
    }
    const image = await Jimp.read(thumbnailUrl);

    let redSum = 0, greenSum = 0, blueSum = 0, pixelCount = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];

        // Skip pure black pixels
        if (red === 0 && green === 0 && blue === 0) {
            return;
        }

        redSum += red;
        greenSum += green;
        blueSum += blue;

        pixelCount++;
    });

    const luminosity_multiplier = 2;

    const averageRed = clamp(Math.round((redSum / pixelCount) * luminosity_multiplier), 0, 255);
    const averageGreen = clamp(Math.round((greenSum / pixelCount) * luminosity_multiplier), 0, 255);
    const averageBlue = clamp(Math.round((blueSum / pixelCount) * luminosity_multiplier), 0, 255);

    const averageColorHex = rgbToHex({ r: averageRed, g: averageGreen, b: averageBlue });
    const luminosity = (0.2126 * averageRed + 0.7152 * averageGreen + 0.0722 * averageBlue) / 255;

    console.log(url, averageColorHex, luminosity);
    return { 'color': averageColorHex, 'luminance': luminosity };
}

//@ts-ignore
export async function getDominantColor(url: string, global_url?: boolean): Promise<Jimp.RGBA> {


    let thumbnailUrl = url;
    if (global_url) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
        const oembedResponse = await fetch(oembedUrl);
        const oembedJson = await oembedResponse.json();
        thumbnailUrl = oembedJson.thumbnail_url;
    }

    const image = await Jimp.read(thumbnailUrl);

    const colorCount: Record<string, number> = {};
    let dominantColor;
    const threshold = 10;
    let dominantColor_rgba = { r: 0, g: 0, b: 0, a: 0 };
    let maxCount = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        const red = image.bitmap.data[idx];
        const green = image.bitmap.data[idx + 1];
        const blue = image.bitmap.data[idx + 2];
        const alpha = image.bitmap.data[idx + 3];

        if (red + green + blue < threshold) {
            // Ignore this color
            return;
        }

        const colorKey = `${red},${green},${blue},${alpha}`;

        if (colorCount[colorKey]) {
            colorCount[colorKey]++;
        } else {
            colorCount[colorKey] = 1;
        }

        if (colorCount[colorKey] > maxCount) {
            maxCount = colorCount[colorKey];
            dominantColor_rgba = { r: red, g: green, b: blue, a: alpha };
        }
    });

    dominantColor = rgbToHex(dominantColor_rgba);
    console.log(url, dominantColor);

    return dominantColor;
}

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // get all entries that don't have a set color field (#000000)
    const tracks = await prisma.track.findMany({
        /* where: {
            color: '#000000',
        }, */
    });

    // for each entry, get the dominant color of the image
    const tracksWithColors = await Promise.all(
        tracks.map(async (track) => {
            console.log(`processing ${track.url}`);
            let dominantColor = '#000000';
            let luminance = 0;
            try {
                const color_data = await getAverageColor(track.url, true);
                dominantColor = color_data.color;
                luminance = color_data.luminance;
            } catch (e) {
                console.log(`error processing ${track.url} | ${e}`);
            }
            return {
                ...track,
                color: dominantColor,
                luminance: luminance,
            };
        }),
    );

    // update the entries with the dominant color
    const updatedTracks = await Promise.all(
        tracksWithColors.map(async (track) => {
            return prisma.track.update({
                where: {
                    id: track.id,
                },
                data: {
                    color: track.color,
                    luminance: track.luminance,
                },
            });
        }),
    );

    /* log the update of the tracks */
    await prisma.log.create({
        data: {
            time: new Date(),
            type: 'update',
            message: `Updated ${updatedTracks.length} tracks with dominant color`,
            history: JSON.stringify(updatedTracks),
        },
    });

    console.log(`updated ${updatedTracks.length} tracks`);
    res.json(updatedTracks);
}
