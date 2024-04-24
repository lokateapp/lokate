import sizeOf from 'image-size';
import path from 'path';

export async function getImageDimensions(imgPath: string) {
	// console.log('imgPath: ', imgPath);
	try {
		const options = new URL(imgPath);
		let dimensions: { width: number; height: number } = { width: 0, height: 0 };
		await fetch(options).then(async (response) => {
			const buffer = Buffer.from(await response.arrayBuffer());
			const test = sizeOf(buffer);
			// console.log('test: ', test);
			dimensions.width = test.width || 0;
			dimensions.height = test.height || 0;
		});
		return {
			floorplanImgWidth: dimensions.width || 0,
			floorplanImgHeight: dimensions.height || 0
		};
	} catch (error) {
		const dimensions = sizeOf(path.join(process.cwd(), imgPath));
		return {
			floorplanImgWidth: dimensions.width || 0,
			floorplanImgHeight: dimensions.height || 0
		};
	}
}
