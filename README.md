# Bridge-deal

Deal sample bridge hands based on a set of criteria.

[Use](https://hildjj.github.io/bridge-deal/)

Usage:
- Enter filter criteria in the editor
- Press the "next" button, which is the right-arrow
- Note the optimal outcome according to the double-dummy solver, and how
  many tricks can be made in each suit with optimal play.
- Consider if the criteria are correct for the bids you want (discover new criteria for the filter)
- Consider what your next bid will be

## Filter language

### Indentation

Indentation of spaces and tabs at the beginning of a line is ignored.  It can
be used to enhance readability.

### Comments

Comments start with `//`, and disable processing of everything from those
slashes to the end of that line.

### Bids

Bids are unconditional, for all matching hands.  Examples:

```
bid P
bid 1C!: 16+, artificial
bid X: Takeout
bid XX!
```

The `!` after the bid means "Alert!".  Everything after the colon, to the end
of the line is a description of the bid.

### Variables

You can set a variable with `$var = text`.  Only text type variables are
supported.  Variables can only be used in bids, referenced with `${var}`.
Example:

```
$suit = C
bid 1${suit}: At least 3 ${suit}.
```

### Weights

A weighting list is set with syntax such as `%var = 4, 3, 2, 1`.

### Operators

Standard operators are `<`, `>`, `<=`, `>=`, and `=`.

### Current Hand

Criteria always apply to a single hand.  Set the current hand with `north`,
`south`, `east`, or `west`.  Case is ignored.

### Suits

Supported suit names:

- C: Clubs
- D: Diamonds
- H: Hearts
- S: Spades
- M: Hearts, Spades
- m: Clubs, Diamonds
- R: Clubs, Hearts,
- r: Diamonds, Hearts
- P: Diamonds, Spades
- b: Clubs, Spades
- X: Clubs, Diamonds, Hearts, Spades

Suit names can be combined, so `1CD` is the same as `1m`.

### Criteria

A criteria set consists of one or more criteria parts, separated by commas.
The current supported criteria parts are:

- Suit holding: `6M` (6H or 6S), `6+X` (At least 6 of any suit), `<2D` (less
  than two diamonds), `<=1D` (O or 1 diamond), `4-5S` (four or five spades).
- Weight: Using a previously-declared weighting such as `%points = 4, 3, 2, 1`,
  you can check the weight of a suit with `S%points > 3`.  This adds 4 if the
  hand's spade suit as the ace, 3 if it has the king, etc.
- Suit length comparisons: Compare the length of two suits with `S >= H` (hand
  holds at least as many spades as hearts)
- Distribution: Check for a specific shape with `5332` (5 spades, 3 hearts, 3
  diamonds, 2 clubs), or check for unspecified-suit shape with `any 4441` (one
  unspecified suit has a singleton, all the rest have 4).
- Point count range: `11-13` means at least 11 high card points, at most 13.
- Point count: `8` means exactly 8 high card points.  `8+` means at least 8.
- Balanced: `balanced` means no 5+ card major, no singleton, no void, not 5-4.
  `balanced5` is the same, but allows for 5 card majors.
- Specific cards: `CAK` means the club ace *and* the club king are both in the
  current hand.

Example:

```
%points = 4, 3
north
  13-15, 4414, D%points >= 3 // Either diamond ace or king
  bid 1N: Should we open these hands 1N?
```

### Reject

Criteria starting with `!` will discard any hand matching these criteria.
Multiple rejections in a row are independent from one another, and all apply
to the current state.

Example:

```
north
  !11-13, balanced // Reject any 11-13 point balanced hands
  !<8 // Reject any hand with less than 8 points
```

### Filter

Criteria starting with `!!` will discard any hand NOT matching these criteria.
Multiple filters at the same level are independent from one another, and all
apply to the current state.  Example:

```
north
  !!11-13, balanced // Reject any hands that are not 11-13 points, balanced
```

### Accept

There are often multiple possibilities for a single bid.  Each of those should
have an set of criteria with no `!` in front.  If the current deal does not
meet the first set of criteria, then the next set of acceptance criteria are
checked.  Example:

```
South
  !4-7, 6+M // Not constructive major responses
  !4-7, 7+m // Not constructive minor responses
  <=7 // EITHER 0-7
  8+, any 4441 // OR the impossible negative
```
