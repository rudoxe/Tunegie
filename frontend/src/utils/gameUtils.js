// Helper function to calculate string similarity (Levenshtein distance based)
export const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = [];
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len2][len1]) / maxLen;
};

// Helper function to calculate overlap percentage
export const calculateOverlap = (guess, target) => {
  const guessWords = guess.split(' ');
  
  let matchedChars = 0;
  let totalGuessChars = guess.replace(/\s/g, '').length;
  
  for (const guessWord of guessWords) {
    if (guessWord.length >= 2) { // Only count meaningful words
      if (target.includes(guessWord)) {
        matchedChars += guessWord.length;
      }
    }
  }
  
  return totalGuessChars > 0 ? matchedChars / totalGuessChars : 0;
};

// Function to validate and score a guess
export const validateGuess = (userGuess, currentTrack) => {
  if (!userGuess.trim()) return { correct: false, matchType: 'empty' };

  const correctAnswer = `${currentTrack.title} - ${currentTrack.artists[0].name}`;
  const guessLower = userGuess.toLowerCase().trim();
  const titleLower = currentTrack.title.toLowerCase();
  const artistLower = currentTrack.artists[0].name.toLowerCase();

  // Declare variables at function level
  let correct = false;
  let matchType = '';

  // Require minimum length to prevent single letter matches
  if (guessLower.length < 3) {
    correct = false;
    matchType = 'too short';
    console.log(`❌ Guess too short: "${userGuess}" (minimum 3 characters)`);
  } else {
    // More strict matching logic - clean strings for better comparison
    const cleanGuess = guessLower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const cleanTitle = titleLower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const cleanArtist = artistLower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    
    // Check for substantial matches (not just single letters)
    
    // 1. Exact matches (highest priority)
    if (cleanGuess === cleanTitle || cleanGuess === cleanArtist) {
      correct = true;
      matchType = 'exact';
    }
    // 2. Very close matches (80%+ similarity for longer strings)
    else if (cleanGuess.length >= 5) {
      const titleSimilarity = calculateSimilarity(cleanGuess, cleanTitle);
      const artistSimilarity = calculateSimilarity(cleanGuess, cleanArtist);
      
      if (titleSimilarity >= 0.8 || artistSimilarity >= 0.8) {
        correct = true;
        matchType = 'very close';
      }
      // 3. Contains significant portion (50%+ of the guess must match)
      else {
        const titleOverlap = calculateOverlap(cleanGuess, cleanTitle);
        const artistOverlap = calculateOverlap(cleanGuess, cleanArtist);
        
        if (titleOverlap >= 0.5 || artistOverlap >= 0.5) {
          correct = true;
          matchType = 'partial';
        }
      }
    }
    // 4. For shorter guesses (3-4 chars), require exact substring match
    else {
      if (cleanTitle.includes(cleanGuess) || cleanArtist.includes(cleanGuess)) {
        // Additional check: the guess should be a meaningful part (not just common words)
        const commonWords = ['the', 'and', 'you', 'are', 'for', 'all', 'not', 'but', 'can', 'had', 'was'];
        if (!commonWords.includes(cleanGuess)) {
          correct = true;
          matchType = 'substring';
        }
      }
    }
  }
  
  // Log result
  console.log(`🎯 Guess: "${userGuess}" | Title: "${currentTrack.title}" | Artist: "${currentTrack.artists[0].name}" | Match: ${correct ? `✅ ${matchType}` : `❌ ${matchType || 'no match'}`}`);
  
  return {
    correct,
    matchType,
    correctAnswer
  };
};

// Function to determine if an album is a single release
export const isSingleRelease = (albumTitle, trackTitle) => {
  if (!albumTitle) return false;
  
  return albumTitle.toLowerCase().includes('single') ||
    albumTitle.toLowerCase() === trackTitle.toLowerCase() ||
    albumTitle.toLowerCase().includes(' - single') ||
    albumTitle.toLowerCase().includes('(single)') ||
    albumTitle.toLowerCase().includes('- ep') ||
    albumTitle.toLowerCase().includes('(ep)') ||
    albumTitle.toLowerCase().includes(trackTitle.toLowerCase()) ||
    trackTitle.toLowerCase().includes(albumTitle.toLowerCase()) ||
    albumTitle.toLowerCase().includes('remix') ||
    albumTitle.toLowerCase().includes('feat.') ||
    albumTitle.toLowerCase().includes('featuring') ||
    albumTitle.split(' ').length <= 3;
};

