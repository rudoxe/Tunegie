class iTunesApiService {
  constructor() {
    this.baseUrl = 'https://itunes.apple.com/search';
    this.countryCode = 'US';
  }

  // Make API requests to iTunes
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

    console.log(`🎵 iTunes API request: ${url.toString()}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`iTunes API error: ${response.status}`);
      }
      
      const data = await response.json();
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
      // Search specifically for the artist
      const data = await this.makeApiRequest({
        term: artistName,
        limit: 100 // Get more results to filter from
      });

      if (!data.results || data.results.length === 0) {
        console.warn(`❌ No results found for artist: ${artistName}`);
        return [];
      }

      // Filter for tracks that match the artist and have previews
      const artistTracks = data.results.filter(track => {
        if (!track.previewUrl) return false;
        
        const normalizedRequestedArtist = this.normalizeString(artistName);
        const normalizedTrackArtist = this.normalizeString(track.artistName);
        
        // Check for exact match or partial match
        return normalizedTrackArtist.includes(normalizedRequestedArtist) || 
               normalizedRequestedArtist.includes(normalizedTrackArtist) ||
               this.artistNamesMatch(normalizedRequestedArtist, normalizedTrackArtist);
      });

      console.log(`🎵 Found ${artistTracks.length} matching tracks for ${artistName}`);
      
      if (artistTracks.length === 0) {
        console.warn(`❌ No tracks with previews found for artist: ${artistName}`);
        console.log('Try checking the spelling or using a different artist name');
        return [];
      }

      // Shuffle and limit results
      const shuffled = artistTracks.sort(() => 0.5 - Math.random());
      const limitedTracks = shuffled.slice(0, count);
      
      console.log(`✅ Returning ${limitedTracks.length} tracks:`);
      limitedTracks.forEach(track => {
        console.log(`  - "${track.trackName}" by ${track.artistName}`);
      });

      return limitedTracks.map(track => this.formatTrack(track));
      
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
      console.log('🧪 Testing iTunes API connection...');
      
      const testData = await this.makeApiRequest({
        term: 'test',
        limit: 1
      });

      const isConnected = testData && testData.results;
      
      if (isConnected) {
        console.log('✅ iTunes API connection successful');
      } else {
        console.log('❌ iTunes API connection failed - no results returned');
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