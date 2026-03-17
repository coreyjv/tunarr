import { describe, expect, it } from 'vitest';
import { MasterPlaylistGenerator } from './MasterPlaylistGenerator.ts';

describe('MasterPlaylistGenerator', () => {
  const generator = new MasterPlaylistGenerator();

  const baseOpts = {
    channelId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    sessionType: 'hls',
    language: 'eng',
    bandwidth: 2192000,
  };

  describe('generate()', () => {
    it('starts with #EXTM3U and version header', () => {
      const result = generator.generate(baseOpts);
      const lines = result.split('\n');
      expect(lines[0]).toBe('#EXTM3U');
      expect(lines[1]).toBe('#EXT-X-VERSION:6');
    });

    it('includes EXT-X-MEDIA with TYPE=SUBTITLES', () => {
      const result = generator.generate(baseOpts);
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'));
      expect(mediaLine).toBeDefined();
      expect(mediaLine).toContain('TYPE=SUBTITLES');
    });

    it('sets subtitle GROUP-ID to "subs"', () => {
      const result = generator.generate(baseOpts);
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('GROUP-ID="subs"');
    });

    it('derives NAME from the language code', () => {
      const result = generator.generate({ ...baseOpts, language: 'spa' });
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('NAME="Spanish"');
    });

    it('uses the language code as NAME for unrecognized languages', () => {
      const result = generator.generate({ ...baseOpts, language: 'tlh' });
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('NAME="tlh"');
    });

    it('sets DEFAULT=YES and AUTOSELECT=YES', () => {
      const result = generator.generate(baseOpts);
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('DEFAULT=YES');
      expect(mediaLine).toContain('AUTOSELECT=YES');
    });

    it('sets FORCED=NO', () => {
      const result = generator.generate(baseOpts);
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('FORCED=NO');
    });

    it('sets LANGUAGE from language option', () => {
      const result = generator.generate({ ...baseOpts, language: 'jpn' });
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('LANGUAGE="jpn"');
    });

    it('points subtitle URI to absolute subtitles.m3u8 path', () => {
      const result = generator.generate(baseOpts);
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain(
        `URI="/stream/channels/${baseOpts.channelId}/${baseOpts.sessionType}/subtitles.m3u8"`,
      );
    });

    it('uses the sessionType in the subtitle URI', () => {
      const result = generator.generate({
        ...baseOpts,
        sessionType: 'hls_direct_v2',
      });
      const mediaLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-MEDIA'))!;
      expect(mediaLine).toContain('/hls_direct_v2/subtitles.m3u8');
    });

    it('includes EXT-X-STREAM-INF with BANDWIDTH and SUBTITLES group reference', () => {
      const result = generator.generate(baseOpts);
      const streamInfLine = result
        .split('\n')
        .find((l) => l.startsWith('#EXT-X-STREAM-INF'))!;
      expect(streamInfLine).toBeDefined();
      expect(streamInfLine).toContain(`BANDWIDTH=${baseOpts.bandwidth}`);
      expect(streamInfLine).toContain('SUBTITLES="subs"');
    });

    it('points video URI to absolute stream.m3u8 path', () => {
      const result = generator.generate(baseOpts);
      const lines = result.split('\n');
      const streamInfIdx = lines.findIndex((l) =>
        l.startsWith('#EXT-X-STREAM-INF'),
      );
      const videoUri = lines[streamInfIdx + 1];
      expect(videoUri).toBe(
        `/stream/channels/${baseOpts.channelId}/${baseOpts.sessionType}/stream.m3u8`,
      );
    });

    it('uses the same channelId in both playlist URIs', () => {
      const channelId = 'ffffffff-0000-1111-2222-333333333333';
      const result = generator.generate({ ...baseOpts, channelId });
      expect(result).toContain(
        `/stream/channels/${channelId}/hls/subtitles.m3u8`,
      );
      expect(result).toContain(`/stream/channels/${channelId}/hls/stream.m3u8`);
    });
  });
});
