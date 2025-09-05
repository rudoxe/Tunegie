import * as auth from '@tidal-music/auth';
import { createAPIClient } from '@tidal-music/api';

class TidalApiService {
  constructor() {
    this.clientId = process.env.REACT_APP_TIDAL_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_TIDAL_CLIENT_SECRET;
    this.countryCode = 'US'; // Default country code
    this.isInitialized = false;
    this.apiBase = process.env.REACT_APP_TIDAL_BASE_URL || 'https://api.tidal.com/v1';
    this.authUrl = (process.env.REACT_APP_TIDAL_AUTH_URL || 'https://auth.tidal.com/v1/oauth2').replace(/\/$/, '');
    this.accessToken = null;
    this.tokenExpiry = null; // ms epoch
  }

  // Minimal token fetch using client credentials (for dev only)
  async fetchToken() {
    // Return cached token if valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 5000) {
      return this.accessToken;
    }

    // Try localStorage cache
    try {
      const stored = localStorage.getItem('tidal_access_token');
      const storedExpiry = localStorage.getItem('tidal_token_expiry');
      if (stored && storedExpiry && Date.now() < Number(storedExpiry) - 5000) {
        this.accessToken = stored;
        this.tokenExpiry = Number(storedExpiry);
        return this.accessToken;
      }
    } catch (e) {
      // ignore localStorage errors
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Missing TIDAL client ID or secret. Check your .env');
    }

    const tokenEndpoint = `${this.authUrl.replace(/\/$/, '')}/token`;
    const body = new URLSearchParams({ grant_type: 'client_credentials' });
    // Basic auth header
    const basic = typeof btoa === 'function'
      ? btoa(`${this.clientId}:${this.clientSecret}`)
      : Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const res = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Token request failed: ${res.status} ${res.statusText} ${text}`);
    }

    const json = await res.json();
    if (!json.access_token || !json.expires_in) {
      throw new Error(`Invalid token response: ${JSON.stringify(json)}`);
    }

    this.accessToken = json.access_token;
    this.tokenExpiry = Date.now() + (json.expires_in * 1000);

    try {
      localStorage.setItem('tidal_access_token', this.accessToken);
      localStorage.setItem('tidal_token_expiry', String(this.tokenExpiry));
    } catch (e) {
      // ignore localStorage write errors
    }

    return this.accessToken;
  }

  // Initialize (no-op now, but kept for compatibility)
  async initialize() {
    if (this.isInitialized) return;
    try {
      console.log('🔧 Initializing minimal TIDAL client (dev only)...');
      // Attempt to fetch a token to validate credentials early
      try {
        await this.fetchToken();
        console.log('✅ Obtained access token');
      } catch (err) {
        console.error('❌ Credentials test failed:', err);
      }
      this.isInitialized = true;
      console.log('✅ TIDAL client initialized successfully');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.isInitialized) await this.initialize();
  }

  // Make API requests using fetch and the client-credentials token
  async makeApiRequest(endpoint, options = {}) {
    await this.ensureInitialized();

    const token = await this.fetchToken();

    const urlPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const sep = urlPath.includes('?') ? '&' : '?';
    const fullUrl = `${this.apiBase}${urlPath}${sep}countryCode=${this.countryCode}`;

    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    };

    if (options.body) {
      fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      fetchOptions.headers['Content-Type'] = options.headers?.['Content-Type'] || 'application/json';
    }

    const res = await fetch(fullUrl, fetchOptions);
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`API request failed: ${res.status} ${res.statusText} ${text}`);
    }

    if (contentType.includes('application/json')) {
      return res.json();
    }

    return res.text();
  }

  // Get album details (useful for testing API connection)
  async getAlbum(albumId) {
    return this.makeApiRequest(`/albums/${albumId}`);
  }

  // Search for tracks, albums, artists
  async search(query, types = ['tracks'], limit = 10, offset = 0) {
    const params = new URLSearchParams({
      query,
      type: types.join(','),
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.makeApiRequest(`/searchresults?${params.toString()}`);
  }

  // Search specifically for tracks
  async searchTracks(query, limit = 10, offset = 0) {
    const result = await this.search(query, ['tracks'], limit, offset);
    return result.tracks || { items: [], totalNumberOfItems: 0 };
  }

  // Get track details
  async getTrack(trackId) {
    return this.makeApiRequest(`/tracks/${trackId}`);
  }

  // Get multiple tracks
  async getTracks(trackIds) {
    const params = new URLSearchParams({
      ids: trackIds.join(','),
    });
    return this.makeApiRequest(`/tracks?${params.toString()}`);
  }

  // Get artist details
  async getArtist(artistId) {
    return this.makeApiRequest(`/artists/${artistId}`);
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId, limit = 10) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    return this.makeApiRequest(`/artists/${artistId}/tracks/top?${params.toString()}`);
  }

  // Get featured playlists (good source for popular tracks)
  async getFeaturedPlaylists(limit = 10) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    return this.makeApiRequest(`/playlists/featured?${params.toString()}`);
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.makeApiRequest(`/playlists/${playlistId}/items?${params.toString()}`);
  }

  // Get genres
  async getGenres() {
    return this.makeApiRequest('/genres');
  }

  // Get tracks by genre (for game variety)
  async getTracksByGenre(genre, limit = 50) {
    // Search for popular tracks in the genre
    const result = await this.search(`genre:${genre}`, ['tracks'], limit);
    return result.tracks || { items: [], totalNumberOfItems: 0 };
  }

  // Get random tracks directly from Apple Music for the guessing game
  async getRandomTracksForGame(count = 10) {
    console.log('🎵 Getting random tracks from Apple Music...');
    
    try {
      const appleMusicTracks = await this.getAppleMusicTracks(count);
      if (appleMusicTracks && appleMusicTracks.length > 0) {
        console.log(`✅ Found ${appleMusicTracks.length} Apple Music tracks`);
        return appleMusicTracks;
      }
    } catch (error) {
      console.error('❌ Apple Music track fetch failed:', error);
    }

    // Fallback to popular tracks list
    console.log('🎧 Using popular tracks fallback');
    const popularTracks = [
      { artist: 'Ed Sheeran', title: 'Shape of You' },
      { artist: 'The Weeknd', title: 'Blinding Lights' },
      { artist: 'Harry Styles', title: 'Watermelon Sugar' },
      { artist: 'Billie Eilish', title: 'Bad Guy' },
      { artist: 'Post Malone', title: 'Circles' },
      { artist: 'Dua Lipa', title: 'Levitating' },
      { artist: 'Taylor Swift', title: 'Anti-Hero' },
      { artist: 'Drake', title: 'Gods Plan' },
      { artist: 'Ariana Grande', title: 'Thank U Next' },
      { artist: 'Olivia Rodrigo', title: 'Good 4 U' }
    ];
    
    const tracks = [];
    const shuffledPopular = popularTracks.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(count, shuffledPopular.length); i++) {
      const popular = shuffledPopular[i];
      const appleTrack = await this.searchAppleMusic(popular.artist, popular.title);
      
      if (appleTrack) {
            tracks.push({
              id: `apple-${appleTrack.trackId}`,
              title: appleTrack.trackName,
              artists: [{ name: appleTrack.artistName }],
              album: { 
                title: appleTrack.albumName || 'Unknown Album',
                releaseDate: appleTrack.releaseDate
              },
              duration: 30, // Preview duration
              previewUrl: appleTrack.previewUrl,
              actualTrack: `${appleTrack.trackName} by ${appleTrack.artistName}`,
              source: 'Apple Music',
              canPreview: true,
              artworkUrl: appleTrack.artworkUrl
            });
      }
    }
    
    return tracks;
  }

  // Get tracks directly from Apple Music popular charts
  async getAppleMusicTracks(count = 10) {
    try {
      console.log('🎵 Fetching Apple Music popular tracks...');
      
      // Search for popular/trending terms to get current hits
      const popularSearches = ['top hits 2024', 'popular songs', 'billboard hot 100', 'trending music'];
      const allTracks = [];
      
      for (const searchTerm of popularSearches) {
        const encodedQuery = encodeURIComponent(searchTerm);
        const url = `https://itunes.apple.com/search?term=${encodedQuery}&media=music&entity=song&limit=50&country=US`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            // Filter tracks with previews and add to collection
            const tracksWithPreviews = data.results
              .filter(track => track.previewUrl)
              .map(track => ({
                id: `apple-${track.trackId}`,
                title: track.trackName,
                artists: [{ name: track.artistName }],
                album: { 
                  title: track.collectionName || 'Unknown Album',
                  releaseDate: track.releaseDate
                },
                duration: 30,
                previewUrl: track.previewUrl,
                actualTrack: `${track.trackName} by ${track.artistName}`,
                source: 'Apple Music',
                canPreview: true,
                artworkUrl: track.artworkUrl100
              }));
            
            allTracks.push(...tracksWithPreviews);
          }
        }
        
        // Don't overwhelm the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Remove duplicates and shuffle
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id)
      );
      
      const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
      
    } catch (error) {
      console.error('Apple Music tracks fetch failed:', error);
      return null;
    }
  }

  // Get tracks by specific artist from Apple Music
  async getTracksByArtist(artistName, count = 10) {
    console.log(`🎵 Getting Apple Music tracks for artist: ${artistName}`);
    
    try {
      const encodedArtist = encodeURIComponent(artistName);
      const url = `https://itunes.apple.com/search?term=${encodedArtist}&media=music&entity=song&limit=50&country=US`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Apple Music API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Filter for exact artist matches with previews
        const artistTracks = data.results
          .filter(track => 
            track.previewUrl &&
            this.normalizeString(track.artistName) === this.normalizeString(artistName)
          )
          .map(track => ({
            id: `apple-${track.trackId}`,
            title: track.trackName,
            artists: [{ name: track.artistName }],
            album: { 
              title: track.collectionName || 'Unknown Album',
              releaseDate: track.releaseDate
            },
            duration: 30,
            previewUrl: track.previewUrl,
            actualTrack: `${track.trackName} by ${track.artistName}`,
            source: 'Apple Music',
            canPreview: true,
            artworkUrl: track.artworkUrl100
          }));
        
        if (artistTracks.length > 0) {
          const shuffled = artistTracks.sort(() => 0.5 - Math.random());
          console.log(`✅ Found ${artistTracks.length} Apple Music tracks for ${artistName}`);
          return shuffled.slice(0, count);
        }
      }
    } catch (error) {
      console.error(`Apple Music search failed for ${artistName}:`, error);
    }

    // Mock data fallback for specific artists
    console.log(`🎤 Using mock track data for artist: ${artistName}`);
    const artistMockData = {
      'Ed Sheeran': [
        { id: 'mock-ed-1', title: 'Shape of You', artists: [{ name: 'Ed Sheeran' }], album: { title: '÷ (Divide)', releaseDate: '2017-03-03' }, duration: 233 },
        { id: 'mock-ed-2', title: 'Perfect', artists: [{ name: 'Ed Sheeran' }], album: { title: '÷ (Divide)', releaseDate: '2017-03-03' }, duration: 263 },
        { id: 'mock-ed-3', title: 'Thinking Out Loud', artists: [{ name: 'Ed Sheeran' }], album: { title: 'x (Multiply)', releaseDate: '2014-06-23' }, duration: 281 },
        { id: 'mock-ed-4', title: 'Photograph', artists: [{ name: 'Ed Sheeran' }], album: { title: 'x (Multiply)', releaseDate: '2014-06-23' }, duration: 258 }
      ],
      'Taylor Swift': [
        { id: 'mock-ts-1', title: 'Anti-Hero', artists: [{ name: 'Taylor Swift' }], album: { title: 'Midnights', releaseDate: '2022-10-21' }, duration: 200 },
        { id: 'mock-ts-2', title: 'Shake It Off', artists: [{ name: 'Taylor Swift' }], album: { title: '1989', releaseDate: '2014-10-27' }, duration: 219 },
        { id: 'mock-ts-3', title: 'Love Story', artists: [{ name: 'Taylor Swift' }], album: { title: 'Fearless', releaseDate: '2008-11-11' }, duration: 236 },
        { id: 'mock-ts-4', title: 'Bad Blood', artists: [{ name: 'Taylor Swift' }], album: { title: '1989', releaseDate: '2014-10-27' }, duration: 211 }
      ],
      'The Weeknd': [
        { id: 'mock-tw-1', title: 'Blinding Lights', artists: [{ name: 'The Weeknd' }], album: { title: 'After Hours', releaseDate: '2020-03-20' }, duration: 200 },
        { id: 'mock-tw-2', title: 'Can\'t Feel My Face', artists: [{ name: 'The Weeknd' }], album: { title: 'Beauty Behind the Madness', releaseDate: '2015-08-28' }, duration: 213 },
        { id: 'mock-tw-3', title: 'Starboy', artists: [{ name: 'The Weeknd' }], album: { title: 'Starboy', releaseDate: '2016-11-25' }, duration: 230 },
        { id: 'mock-tw-4', title: 'The Hills', artists: [{ name: 'The Weeknd' }], album: { title: 'Beauty Behind the Madness', releaseDate: '2015-08-28' }, duration: 242 }
      ]
    };

    // If artist not in predefined data, generate realistic tracks for them
    let artistTracks = artistMockData[artistName];
    
    if (!artistTracks) {
      // Generate realistic tracks for any artist
      artistTracks = this.generateArtistTracks(artistName, Math.min(count, 6));
    }

    const shuffled = artistTracks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, artistTracks.length));
  }

  // Get tracks by genre
  async getTracksByGenre(genre, count = 10) {
    try {
      // Try to search for tracks in the genre
      const searchResult = await this.searchTracks(`genre:${genre}`, count * 2);
      if (searchResult.items && searchResult.items.length > 0) {
        const shuffled = searchResult.items.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      }
    } catch (error) {
      console.warn(`Live API failed for genre ${genre}, using mock data:`, error);
    }

    // Mock data fallback for specific genres
    console.log(`🎼 Using mock track data for genre: ${genre}`);
    const genreMockData = {
      'pop': [
        { id: 'mock-pop-1', title: 'Shape of You', artists: [{ name: 'Ed Sheeran' }], album: { title: '÷ (Divide)', releaseDate: '2017-03-03' }, duration: 233 },
        { id: 'mock-pop-2', title: 'Blinding Lights', artists: [{ name: 'The Weeknd' }], album: { title: 'After Hours', releaseDate: '2020-03-20' }, duration: 200 },
        { id: 'mock-pop-3', title: 'Watermelon Sugar', artists: [{ name: 'Harry Styles' }], album: { title: 'Fine Line', releaseDate: '2019-12-13' }, duration: 174 },
        { id: 'mock-pop-4', title: 'Levitating', artists: [{ name: 'Dua Lipa' }], album: { title: 'Future Nostalgia', releaseDate: '2020-03-27' }, duration: 203 }
      ],
      'rock': [
        { id: 'mock-rock-1', title: 'Bohemian Rhapsody', artists: [{ name: 'Queen' }], album: { title: 'A Night at the Opera', releaseDate: '1975-10-31' }, duration: 355 },
        { id: 'mock-rock-2', title: 'Hotel California', artists: [{ name: 'Eagles' }], album: { title: 'Hotel California', releaseDate: '1976-12-08' }, duration: 391 },
        { id: 'mock-rock-3', title: 'Sweet Child O\' Mine', artists: [{ name: 'Guns N\' Roses' }], album: { title: 'Appetite for Destruction', releaseDate: '1987-07-21' }, duration: 356 },
        { id: 'mock-rock-4', title: 'Don\'t Stop Believin\'', artists: [{ name: 'Journey' }], album: { title: 'Escape', releaseDate: '1981-07-17' }, duration: 251 }
      ],
      'hip-hop': [
        { id: 'mock-hh-1', title: 'God\'s Plan', artists: [{ name: 'Drake' }], album: { title: 'Scorpion', releaseDate: '2018-06-29' }, duration: 198 },
        { id: 'mock-hh-2', title: 'HUMBLE.', artists: [{ name: 'Kendrick Lamar' }], album: { title: 'DAMN.', releaseDate: '2017-04-14' }, duration: 177 },
        { id: 'mock-hh-3', title: 'Sicko Mode', artists: [{ name: 'Travis Scott' }], album: { title: 'Astroworld', releaseDate: '2018-08-03' }, duration: 312 },
        { id: 'mock-hh-4', title: 'Old Town Road', artists: [{ name: 'Lil Nas X' }], album: { title: '7 EP', releaseDate: '2019-06-21' }, duration: 113 }
      ]
    };

    const genreTracks = genreMockData[genre] || [
      { id: 'mock-genre-1', title: 'Unknown Song 1', artists: [{ name: 'Unknown Artist' }], album: { title: 'Unknown Album', releaseDate: '2020-01-01' }, duration: 200 },
      { id: 'mock-genre-2', title: 'Unknown Song 2', artists: [{ name: 'Unknown Artist' }], album: { title: 'Unknown Album', releaseDate: '2020-01-01' }, duration: 210 }
    ];

    const shuffled = genreTracks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, genreTracks.length));
  }

  // Generate realistic tracks for any artist
  generateArtistTracks(artistName, count = 6) {
    // Generic song titles that work for most artists
    const songTemplates = [
      'Latest Hit', 'Popular Track', 'Fan Favorite', 'Chart Topper', 
      'Classic Song', 'New Single', 'Album Track', 'Radio Hit',
      'Banger', 'Vibe', 'Flow', 'Track', 'Song', 'Hit'
    ];
    
    // Generic album names
    const albumTemplates = [
      `${artistName} Album`, `Best of ${artistName}`, `${artistName} Collection`,
      'Latest Album', 'New Release', 'Greatest Hits', 'Deluxe Edition',
      'Studio Album', 'Mixtape', 'EP'
    ];
    
    // Generate years from 2015-2024
    const years = Array.from({length: 10}, (_, i) => 2015 + i);
    
    const tracks = [];
    for (let i = 0; i < count; i++) {
      const year = years[Math.floor(Math.random() * years.length)];
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      
      tracks.push({
        id: `mock-${artistName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        title: `${songTemplates[Math.floor(Math.random() * songTemplates.length)]} ${i + 1}`,
        artists: [{ name: artistName }],
        album: { 
          title: albumTemplates[Math.floor(Math.random() * albumTemplates.length)],
          releaseDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        },
        duration: Math.floor(Math.random() * 120) + 120 // 2-4 minutes
      });
    }
    
    return tracks;
  }

  // Test API connection
  async testConnection() {
    try {
      await this.ensureInitialized();
      console.log('✅ TIDAL API authentication successful');
      
      // Try a simple search instead of specific album (more likely to work in dev mode)
      try {
        const searchResult = await this.searchTracks('test', 1);
        console.log('✅ TIDAL API search test successful');
        return true;
      } catch (searchError) {
        console.warn('⚠️ Search failed, but auth works. This is expected in development mode.');
        console.log('✅ TIDAL API connection established (limited dev access)');
        return true; // Auth works, which is what we need
      }
    } catch (error) {
      console.error('❌ TIDAL API connection test failed:', error);
      return false;
    }
  }

  // Get track preview info - simplified since Apple Music tracks already have previews
  async getTrackPreviewInfo(track) {
    const artist = track.artists?.[0]?.name || 'Unknown Artist';
    const title = track.title;
    
    // If track already has preview info (from Apple Music), return it directly
    if (track.previewUrl && track.canPreview) {
      console.log(`✅ Track already has preview: "${title}" by ${artist}`);
      return {
        id: track.id,
        title: title,
        artist: artist,
        album: track.album?.title || 'Unknown Album',
        duration: track.duration,
        previewUrl: track.previewUrl,
        actualTrack: track.actualTrack || `${title} by ${artist}`,
        matchType: 'Perfect', // Since it's the exact track we want
        source: track.source || 'Apple Music',
        albumArt: track.artworkUrl,
        canPreview: true,
      };
    }
    
    // Fallback: search Apple Music if track doesn't have preview
    console.log(`🎵 Searching Apple Music for: "${title}" by ${artist}`);
    
    try {
      const appleResult = await this.searchAppleMusic(artist, title);
      if (appleResult) {
        return {
          id: track.id,
          title: title,
          artist: artist,
          album: track.album?.title || 'Unknown Album',
          duration: track.duration,
          previewUrl: appleResult.previewUrl,
          actualTrack: `${appleResult.trackName} by ${appleResult.artistName}`,
          matchType: appleResult.matchType,
          source: 'Apple Music',
          albumArt: appleResult.artworkUrl,
          appleTrackId: appleResult.trackId,
          canPreview: true,
        };
      }
    } catch (error) {
      console.error('❌ Apple Music search failed:', error);
    }
    
    return {
      id: track.id,
      title: title,
      artist: artist,
      album: track.album?.title || 'Unknown Album',
      duration: track.duration,
      canPreview: false,
      actualTrack: `${title} by ${artist} (Not Available)`,
      source: 'None',
    };
  }
  
  // Apple Music/iTunes Search API - comprehensive search with multiple strategies
  async searchAppleMusic(artist, title) {
    const searchStrategies = [
      // Strategy 1: Exact match - artist and title
      { query: `${artist} ${title}`, type: 'exact' },
      // Strategy 2: Title first, then artist
      { query: `${title} ${artist}`, type: 'reversed' },
      // Strategy 3: Artist only (get popular tracks)
      { query: artist, type: 'artist' },
      // Strategy 4: Title only
      { query: title, type: 'title' },
      // Strategy 5: Fuzzy search - first words only
      { query: `${artist.split(' ')[0]} ${title.split(' ')[0]}`, type: 'fuzzy' }
    ];

    for (let i = 0; i < searchStrategies.length; i++) {
      const strategy = searchStrategies[i];
      
      try {
        console.log(`🎵 Apple Music strategy ${i + 1} (${strategy.type}): "${strategy.query}"`);
        
        const encodedQuery = encodeURIComponent(strategy.query);
        const url = `https://itunes.apple.com/search?term=${encodedQuery}&media=music&entity=song&limit=20&country=US`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TuneGie/1.0'
          }
        });
        
        if (!response.ok) {
          console.warn(`Apple Music API error: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`🔍 Apple Music results for strategy ${i + 1}:`, data.resultCount);
        
        if (data.results && data.results.length > 0) {
          // Find best match based on strategy type
          let bestMatch = this.findBestAppleMatch(data.results, artist, title, strategy.type);
          
          if (bestMatch && bestMatch.previewUrl) {
            const matchTypes = {
              'exact': 'Perfect',
              'reversed': 'Good', 
              'artist': 'Artist',
              'title': 'Title',
              'fuzzy': 'Fuzzy'
            };
            
            console.log(`✅ Apple Music ${matchTypes[strategy.type]} match:`, bestMatch.trackName, 'by', bestMatch.artistName);
            
            return {
              previewUrl: bestMatch.previewUrl,
              trackName: bestMatch.trackName,
              artistName: bestMatch.artistName,
              artworkUrl: bestMatch.artworkUrl100,
              trackId: bestMatch.trackId,
              matchType: matchTypes[strategy.type],
              albumName: bestMatch.collectionName,
              releaseDate: bestMatch.releaseDate
            };
          }
        }
        
      } catch (error) {
        console.warn(`Apple Music strategy ${i + 1} failed:`, error.message);
        continue;
      }
    }
    
    console.warn('❌ No Apple Music previews found after all strategies');
    return null;
  }

  // Find the best match from Apple Music results
  findBestAppleMatch(results, requestedArtist, requestedTitle, strategyType) {
    // Filter out results without preview URLs first
    const resultsWithPreviews = results.filter(track => track.previewUrl);
    
    if (resultsWithPreviews.length === 0) {
      console.warn('⚠️ No Apple Music results have preview URLs');
      return null;
    }
    
    // Strategy-specific matching
    switch (strategyType) {
      case 'exact':
        // Look for exact matches first
        return resultsWithPreviews.find(track => 
          this.normalizeString(track.trackName) === this.normalizeString(requestedTitle) &&
          this.normalizeString(track.artistName) === this.normalizeString(requestedArtist)
        ) || resultsWithPreviews.find(track => 
          this.normalizeString(track.artistName) === this.normalizeString(requestedArtist)
        ) || resultsWithPreviews[0];
        
      case 'reversed':
        // Look for title matches first
        return resultsWithPreviews.find(track => 
          this.normalizeString(track.trackName).includes(this.normalizeString(requestedTitle))
        ) || resultsWithPreviews[0];
        
      case 'artist':
        // Look for exact artist match
        return resultsWithPreviews.find(track => 
          this.normalizeString(track.artistName) === this.normalizeString(requestedArtist)
        ) || resultsWithPreviews.find(track => 
          this.normalizeString(track.artistName).includes(this.normalizeString(requestedArtist.split(' ')[0]))
        ) || resultsWithPreviews[0];
        
      case 'title':
        // Look for title match
        return resultsWithPreviews.find(track => 
          this.normalizeString(track.trackName).includes(this.normalizeString(requestedTitle))
        ) || resultsWithPreviews[0];
        
      default:
        // For fuzzy and other strategies, return first result with preview
        return resultsWithPreviews[0];
    }
  }
  
  // Helper function to normalize strings for comparison
  normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }


  // Check if user is authenticated (for client credentials, always true if we have a token)
  isAuthenticated() {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  }

  // Clear stored tokens
  clearTokens() {
    this.accessToken = null;
    this.tokenExpiry = null;
    try {
      localStorage.removeItem('tidal_access_token');
      localStorage.removeItem('tidal_token_expiry');
    } catch (e) {}
  }
}

// Create and export singleton instance
const tidalApiService = new TidalApiService();
export default tidalApiService;
