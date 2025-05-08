# MapleStory Accuracy Calculator

A single-page web application for calculating hit rates against monsters in MapleStory.

## Overview

This tool helps MapleStory players calculate their accuracy and hit rates against various monsters in the game. It provides both physical and magical accuracy calculations based on character stats and monster data.

## Features

- **Accuracy Calculations**: Calculate hit rates for both physical and magical attacks
- **Monster Database**: Comprehensive database of monsters organized by world/region
- **Search Functionality**: Easily search for specific monsters by name
- **Sorting Options**: Sort monsters alphabetically or by level
- **Monster Details**: View detailed monster information including:
  - Level and Avoid stats
  - HP and EXP values
  - Elemental weaknesses and resistances
  - Monster image
- **Link to MapleStory Library**: Direct links to the official MapleStory monster library

## How to Use

1. **Select a World**: Choose a world/region from the dropdown menu
2. **Select a Monster**: Pick a monster from the list or use the search function
3. **Enter Character Stats**:
   - Level
   - Choose attack type (Physical or Magical)
   - Enter your ACC stat (for physical) or INT stat (for magical)
   - Enter your LUK stat (for magical attacks only)
4. **Calculate**: Click the "Calculate" button to see your hit rate

## Calculation Results

The calculator provides three key pieces of information:
- **Accuracy for 1%**: The minimum accuracy needed for a 1% hit rate
- **Accuracy for 100%**: The accuracy needed for a guaranteed hit
- **Hit Rate**: Your current hit rate percentage based on your stats

## Technical Details

- Built as a single-page application using HTML, CSS, and JavaScript
- Uses jQuery for DOM manipulation and AJAX requests
- Monster data stored in JSON format organized by world/region
- Implements different formulas for physical and magical accuracy calculations

## Credits

Special thanks to:
- Screaming Statue and Nekonecat for their accuracy calculators
- ayumilove and 安心 for their formulas
- Nani guild and Treehouse alliance

## License

This project is available for free use by the MapleStory community.

## How to Contribute

Contributions to improve the calculator or expand the monster database are welcome. Please feel free to submit pull requests or open issues for any bugs or feature requests.
