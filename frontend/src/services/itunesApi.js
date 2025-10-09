class iTunesApiService {
  constructor() {
    // Use PHP proxy to avoid CORS issues
    const apiBase = process.env.NODE_ENV === 'production' ? '/backend/php/api' : 'http://localhost:8000/backend/php/api';
    this.baseUrl = `${apiBase}/game/itunes_proxy.php`;
    this.testUrl = `${apiBase}/game/itunes_test.php`;
    this.countryCode = 'US';
  }

  // Make API requests to iTunes via PHP proxy
  async makeApiRequest(params) {
    const url = new URL(this.baseUrl);
    
    // Add default parameters
    const defaultParams = {
      media: 'music',
      entity: 'song',
      country: this.countryCode,
      explicit: 'Yes'
    };
    
    // Merge with provided parameters
    const finalParams = { ...defaultParams, ...params };
    
    // Add parameters to URL
    Object.keys(finalParams).forEach(key => {
      url.searchParams.append(key, finalParams[key]);
    });

    console.log(`🎵 iTunes API request via PHP proxy: ${url.toString()}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`iTunes API proxy error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Check if proxy returned success
      if (!result.success) {
        throw new Error(result.message || 'API request failed');
      }
      
      // Extract the actual iTunes data
      const data = result.data;
      console.log(`📊 iTunes API returned ${data.resultCount} results`);
      
      return data;
    } catch (error) {
      console.error('❌ iTunes API request failed:', error);
      throw error;
    }
  }

  // Search for tracks
  async searchTracks(query, limit = 50) {
    console.log(`🔍 Searching iTunes for: "${query}"`);
    
    const data = await this.makeApiRequest({
      term: query,
      limit: limit
    });

    // Filter results to only include tracks with preview URLs
    const tracksWithPreviews = data.results.filter(track => track.previewUrl);
    
    console.log(`✅ Found ${tracksWithPreviews.length} tracks with previews out of ${data.results.length} total`);
    
    return tracksWithPreviews.map(track => this.formatTrack(track));
  }

  // Get tracks by specific artist
  async getTracksByArtist(artistName, count = 10) {
    console.log(`🎤 Getting tracks for artist: ${artistName}`);
    
    try {
      // Step 1: Search for the artist to get their ID
      const artistSearch = await this.makeApiRequest({
        term: artistName,
        media: 'music',
        entity: 'musicArtist',
        attribute: 'artistTerm',
        limit: 10
      });

      if (!artistSearch.results?.length) {
        console.warn(`❌ No artist found for: ${artistName}`);
        return [];
      }

      // Find the best artist match (more flexible matching)
      const artist = artistSearch.results.find(a => 
        this.normalizeString(a.artistName).includes(this.normalizeString(artistName)) ||
        this.normalizeString(artistName).includes(this.normalizeString(a.artistName))
      );

      if (!artist) {
        console.warn(`❌ No matching artist found for: ${artistName}`);
        return [];
      }

      console.log(`✅ Found artist: ${artist.artistName} (ID: ${artist.artistId})`);

      // Step 2: Get all tracks by artist ID using lookup
      const tracksResponse = await this.makeApiRequest({
        artistId: artist.artistId,
        entity: 'song',
        lookup: 'true',
        limit: 200
      });

      if (!tracksResponse.results?.length) {
        console.warn(`❌ No tracks found for artist ID: ${artist.artistId}`);
        return [];
      }

      // Get all tracks with previews
      const tracks = tracksResponse.results.filter(item => 
        item.wrapperType === 'track' && 
        item.previewUrl &&
        item.kind === 'song'
      );

      console.log(`📦 Found ${tracks.length} tracks with previews`);

      if (tracks.length === 0) {
        // Fallback: Try direct search if lookup returns no results
        const directSearch = await this.makeApiRequest({
          term: `${artistName} song`,
          attribute: 'artistTerm',
          entity: 'song',
          limit: 200
        });

        if (directSearch.results?.length) {
          const matchingTracks = directSearch.results.filter(track => 
            track.previewUrl &&
            track.artistId === artist.artistId
          );
          tracks.push(...matchingTracks);
        }
      }

      // Sort by popularity (using collection ID as a rough indicator) and release date
      const sortedTracks = tracks.sort((a, b) => {
        // First by collection ID (newer albums usually have higher IDs)
        const collectionDiff = (b.collectionId || 0) - (a.collectionId || 0);
        if (collectionDiff !== 0) return collectionDiff;
        
        // Then by release date
        const aDate = new Date(a.releaseDate || 0);
        const bDate = new Date(b.releaseDate || 0);
        return bDate - aDate;
      });

      // Get top tracks with some randomization
      const selectedTracks = [...sortedTracks]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      console.log(`✅ Returning ${selectedTracks.length} tracks for ${artistName}:`);
      selectedTracks.forEach(track => {
        console.log(`  - "${track.trackName}" from "${track.collectionName}"`);
      });
      
      return selectedTracks.map(track => this.formatTrack(track));
      
    } catch (error) {
      console.error(`❌ Error getting tracks for ${artistName}:`, error);
      return [];
    }
  }

  // Get random popular tracks for general game mode
  async getRandomTracksForGame(count = 10) {
    console.log(`🎲 Getting ${count} random popular tracks`);
    
    try {
      // Search for popular terms to get current hits
      const popularSearchTerms = [
        'top songs 2024',
        'billboard hot 100',
        'popular music',
        'hit songs',
        'trending music'
      ];

      let allTracks = [];

      // Search each term and collect results
      for (const term of popularSearchTerms) {
        try {
          const tracks = await this.searchTracks(term, 50);
          allTracks.push(...tracks);
          
          // Small delay to be respectful to the API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Search failed for term: ${term}`, error);
        }
      }

      // Remove duplicates based on track ID
      const uniqueTracks = allTracks.filter((track, index, self) =>
        index === self.findIndex(t => t.trackId === track.trackId)
      );

      console.log(`🎵 Found ${uniqueTracks.length} unique tracks total`);

      // Shuffle and return requested count
      const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
      const selectedTracks = shuffled.slice(0, count);

      console.log(`✅ Selected ${selectedTracks.length} random tracks for game`);
      return selectedTracks;

    } catch (error) {
      console.error('❌ Error getting random tracks:', error);
      return [];
    }
  }

  // Get tracks by genre
  async getTracksByGenre(genre, count = 10) {
    console.log(`🎼 Getting tracks for genre: ${genre}`);
    
    // Map genre names to search terms that work well with iTunes
    const genreSearchTerms = {
      'pop': ['pop music', 'pop hits', 'top pop songs'],
      'rock': ['rock music', 'rock hits', 'classic rock'],
      'hip-hop': ['hip hop', 'rap music', 'hip hop hits'],
      'r&b': ['r&b music', 'soul music', 'rnb hits'],
      'electronic': ['electronic music', 'edm', 'electronic dance'],
      'country': ['country music', 'country hits', 'country songs'],
      'indie': ['indie music', 'independent music', 'indie rock'],
      'alternative': ['alternative rock', 'alternative music', 'alt rock']
    };

    const searchTerms = genreSearchTerms[genre] || [genre, `${genre} music`, `${genre} songs`];
    let allTracks = [];

    // Search each term for the genre
    for (const term of searchTerms) {
      try {
        const tracks = await this.searchTracks(term, 30);
        allTracks.push(...tracks);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Genre search failed for term: ${term}`, error);
      }
    }

    // Remove duplicates
    const uniqueTracks = allTracks.filter((track, index, self) =>
      index === self.findIndex(t => t.trackId === track.trackId)
    );

    console.log(`🎵 Found ${uniqueTracks.length} tracks for genre: ${genre}`);

    if (uniqueTracks.length === 0) {
      console.warn(`❌ No tracks found for genre: ${genre}`);
      return [];
    }

    // Shuffle and return requested count
    const shuffled = uniqueTracks.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Format track data consistently
  formatTrack(track) {
    return {
      id: `itunes-${track.trackId}`,
      title: track.trackName,
      artists: [{ name: track.artistName }],
      album: {
        title: track.collectionName || 'Unknown Album',
        releaseDate: track.releaseDate
      },
      duration: Math.floor(track.trackTimeMillis / 1000) || 30,
      previewUrl: track.previewUrl,
      actualTrack: `${track.trackName} by ${track.artistName}`,
      source: 'iTunes',
      canPreview: true,
      artworkUrl: track.artworkUrl100,
      // Raw iTunes data for debugging
      _raw: {
        trackId: track.trackId,
        genre: track.primaryGenreName,
        price: track.trackPrice,
        currency: track.currency
      }
    };
  }

  // Helper function to normalize strings for comparison
  normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Check if two artist names match (handles variations)
  artistNamesMatch(name1, name2) {
    // Remove common prefixes like "The"
    const cleanName1 = name1.replace(/^the\s+/, '');
    const cleanName2 = name2.replace(/^the\s+/, '');
    
    return cleanName1 === cleanName2 ||
           cleanName1.includes(cleanName2) ||
           cleanName2.includes(cleanName1);
  }

  // Test API connection
  async testConnection() {
    try {
      console.log('🧪 Testing iTunes API connection via PHP proxy...');
      
      const response = await fetch(this.testUrl);
      
      if (!response.ok) {
        throw new Error(`Test endpoint error: ${response.status}`);
      }
      
      const result = await response.json();
      const isConnected = result.success && result.connected;
      
      if (isConnected) {
        console.log('✅ iTunes API connection successful via PHP proxy');
      } else {
        console.log('❌ iTunes API connection failed:', result.message);
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ iTunes API connection test failed:', error);
      return false;
    }
  }

  // Get track preview info (simplified since iTunes tracks already have previews)
  async getTrackPreviewInfo(track) {
    // iTunes tracks already come with preview URLs
    if (track.previewUrl) {
      return {
        id: track.id,
        title: track.title,
        artist: track.artists[0].name,
        album: track.album.title,
        duration: track.duration,
        previewUrl: track.previewUrl,
        actualTrack: track.actualTrack,
        source: 'iTunes',
        albumArt: track.artworkUrl,
        canPreview: true
      };
    }

    return {
      id: track.id,
      title: track.title,
      artist: track.artists[0].name,
      album: track.album.title,
      duration: track.duration,
      canPreview: false,
      actualTrack: `${track.title} by ${track.artists[0].name} (No Preview)`,
      source: 'None'
    };
  }
}

// Create and export singleton instance
const itunesApiService = new iTunesApiService();
export default itunesApiService;