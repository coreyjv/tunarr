import { describe, expect, it } from 'vitest';
import { HlsWebVttOutputFormat } from './HlsWebVttOutputFormat.ts';

describe('HlsWebVttOutputFormat', () => {
  const baseOpts = {
    subtitleInputIndex: 1,
    subtitleStreamIndex: 0,
    subtitlePlaylistPath: '/tmp/stream_abc/subtitles.m3u8',
    subtitleSegmentTemplate: '/tmp/stream_abc/sub%06d.vtt',
    subtitleBaseUrl: '/stream/channels/abc/hls/',
    segmentStartNumber: 0,
  };

  describe('options()', () => {
    it('maps the correct input:stream index', () => {
      const fmt = new HlsWebVttOutputFormat({
        ...baseOpts,
        subtitleInputIndex: 2,
        subtitleStreamIndex: 3,
      });
      const opts = fmt.options();
      const mapIdx = opts.indexOf('-map');
      expect(mapIdx).toBeGreaterThanOrEqual(0);
      expect(opts[mapIdx + 1]).toBe('2:3');
    });

    it('sets the codec to webvtt', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const codecIdx = opts.indexOf('-c:s');
      expect(codecIdx).toBeGreaterThanOrEqual(0);
      expect(opts[codecIdx + 1]).toBe('webvtt');
    });

    it('uses the segment muxer', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const formatIdx = opts.indexOf('-f');
      expect(formatIdx).toBeGreaterThanOrEqual(0);
      expect(opts[formatIdx + 1]).toBe('segment');
    });

    it('sets segment_format to webvtt', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const segFmtIdx = opts.indexOf('-segment_format');
      expect(segFmtIdx).toBeGreaterThanOrEqual(0);
      expect(opts[segFmtIdx + 1]).toBe('webvtt');
    });

    it('sets segment_time to 4 seconds', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const segTimeIdx = opts.indexOf('-segment_time');
      expect(segTimeIdx).toBeGreaterThanOrEqual(0);
      expect(opts[segTimeIdx + 1]).toBe('4');
    });

    it('sets segment_list to the subtitle playlist path', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const segListIdx = opts.indexOf('-segment_list');
      expect(segListIdx).toBeGreaterThanOrEqual(0);
      expect(opts[segListIdx + 1]).toBe(baseOpts.subtitlePlaylistPath);
    });

    it('includes +live segment_list_flags', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const flagsIdx = opts.indexOf('-segment_list_flags');
      expect(flagsIdx).toBeGreaterThanOrEqual(0);
      expect(opts[flagsIdx + 1]).toBe('+live');
    });

    it('sets segment_list_entry_prefix to the subtitle base URL', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const prefixIdx = opts.indexOf('-segment_list_entry_prefix');
      expect(prefixIdx).toBeGreaterThanOrEqual(0);
      expect(opts[prefixIdx + 1]).toBe(baseOpts.subtitleBaseUrl);
    });

    it('serializes segment_start_number as a string', () => {
      const fmt = new HlsWebVttOutputFormat({
        ...baseOpts,
        segmentStartNumber: 42,
      });
      const opts = fmt.options();
      const startNumIdx = opts.indexOf('-segment_start_number');
      expect(startNumIdx).toBeGreaterThanOrEqual(0);
      expect(opts[startNumIdx + 1]).toBe('42');
    });

    it('uses 0 as segment_start_number when sidecar is starting fresh', () => {
      const fmt = new HlsWebVttOutputFormat({
        ...baseOpts,
        segmentStartNumber: 0,
      });
      const opts = fmt.options();
      const startNumIdx = opts.indexOf('-segment_start_number');
      expect(opts[startNumIdx + 1]).toBe('0');
    });

    it('enables break_non_keyframes', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      const breakIdx = opts.indexOf('-break_non_keyframes');
      expect(breakIdx).toBeGreaterThanOrEqual(0);
      expect(opts[breakIdx + 1]).toBe('1');
    });

    it('ends with the segment template path', () => {
      const fmt = new HlsWebVttOutputFormat(baseOpts);
      const opts = fmt.options();
      expect(opts[opts.length - 1]).toBe(baseOpts.subtitleSegmentTemplate);
    });

    it('increments segment numbering across transcode sessions', () => {
      // Simulates calling a second transcode where segments already exist.
      // The start number ensures new segments don't collide with previous ones.
      const fmtFirst = new HlsWebVttOutputFormat({
        ...baseOpts,
        segmentStartNumber: 0,
      });
      const fmtSecond = new HlsWebVttOutputFormat({
        ...baseOpts,
        segmentStartNumber: 100,
      });

      const firstStartIdx = fmtFirst.options().indexOf('-segment_start_number');
      const secondStartIdx = fmtSecond
        .options()
        .indexOf('-segment_start_number');

      expect(
        parseInt(fmtSecond.options()[secondStartIdx + 1]!),
      ).toBeGreaterThan(parseInt(fmtFirst.options()[firstStartIdx + 1]!));
    });
  });
});
