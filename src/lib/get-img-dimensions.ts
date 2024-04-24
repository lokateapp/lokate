import sizeOf from 'image-size';

export function getImageDimensions(imgPath: string) {
	const dimensions = sizeOf(imgPath);
	return {
		floorplanImgWidth: dimensions.width || 0,
		floorplanImgHeight: dimensions.height || 0
	};
}
