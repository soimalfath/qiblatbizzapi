// import { ApiProperty } from '@nestjs/swagger';

/**
 * @class VideoCategorySnippetDto
 * @description Snippet details for a YouTube video category.
 */
class VideoCategorySnippetDto {
  // @ApiProperty({ description: 'The title of the video category.' })
  title: string;

  // @ApiProperty({
  //   description: 'Indicates whether the category is assignable to a video.',
  // })
  assignable: boolean;

  // @ApiProperty({
  //   description: 'The YouTube channel ID that created the category.',
  // })
  channelId: string; // Typically "UCBR8-60-B28hp2BmDPdntcQ" for default categories
}

/**
 * @class VideoCategoryItemDto
 * @description Represents a single YouTube video category item.
 */
export class VideoCategoryItemDto {
  // @ApiProperty({
  //   description: 'The kind of the resource (e.g., "youtube#videoCategory").',
  // })
  kind: string;

  // @ApiProperty({ description: 'The ETag of the category resource.' })
  etag: string;

  // @ApiProperty({
  //   description:
  //     'The ID that YouTube uses to uniquely identify the video category.',
  // })
  id: string;

  // @ApiProperty({
  //   description:
  //     'The snippet object contains basic details about the video category.',
  //   type: VideoCategorySnippetDto,
  // })
  snippet: VideoCategorySnippetDto;
}

/**
 * @class VideoCategoriesResponseDto
 * @description DTO for the response when fetching YouTube video categories.
 */
export class VideoCategoriesResponseDto {
  // @ApiProperty({
  //   description:
  //     'The kind of the API response (e.g., "youtube#videoCategoryListResponse").',
  // })
  kind: string;

  // @ApiProperty({ description: 'The ETag of the response.' })
  etag: string;

  // @ApiProperty({
  //   description: 'A list of video categories that match the request criteria.',
  //   type: [VideoCategoryItemDto],
  // })
  items: VideoCategoryItemDto[];
}
