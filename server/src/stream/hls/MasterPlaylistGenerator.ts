type MasterPlaylistOptions = {
  channelId: string;
  sessionType: string;
  language: string;
  bandwidth: number;
};

export class MasterPlaylistGenerator {
  generate(opts: MasterPlaylistOptions): string {
    const baseUrl = `/stream/channels/${opts.channelId}/${opts.sessionType}`;
    const videoPlaylistUri = `${baseUrl}/stream.m3u8`;
    const subtitlePlaylistUri = `${baseUrl}/subtitles.m3u8`;
    const trackName = this.trackNameForLanguage(opts.language);

    return [
      '#EXTM3U',
      '#EXT-X-VERSION:6',
      '',
      `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="${trackName}",DEFAULT=YES,AUTOSELECT=YES,FORCED=NO,LANGUAGE="${opts.language}",URI="${subtitlePlaylistUri}"`,
      '',
      `#EXT-X-STREAM-INF:BANDWIDTH=${opts.bandwidth},SUBTITLES="subs"`,
      videoPlaylistUri,
    ].join('\n');
  }

  // TODO replace with a library so all languages are handled (e.g. https://www.npmjs.com/package/iso-639-1)
  private trackNameForLanguage(code: string): string {
    const languageNames: Record<string, string> = {
      eng: 'English',
      spa: 'Spanish',
      fra: 'French',
      deu: 'German',
      ita: 'Italian',
      por: 'Portuguese',
      jpn: 'Japanese',
      kor: 'Korean',
      zho: 'Chinese',
      rus: 'Russian',
      ara: 'Arabic',
      hin: 'Hindi',
      und: 'Unknown',
    };
    return languageNames[code] ?? code;
  }
}
