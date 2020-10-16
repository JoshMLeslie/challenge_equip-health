/* eslint-disable lines-between-class-members */
import {
  GameBoardItemType,
  GameDirection,
  GameDirectionMap,
  pillMax,
} from '../Map';
import Item from './Item';

const moveTo = (possibleMoves: GameBoardItemMove[]) => possibleMoves[Math.round(Math.random() * (possibleMoves.length - 1))];
class Pacman extends Item implements GameBoardItem {
  type: GameBoardItemType = GameBoardItemType.PACMAN;
  lastPos: GameBoardItemMove['piece']['id'] | undefined;
  score: number = 0;

  getNextMove(): GameBoardItemMove | false {
    const { moves } = this.piece;
    let possibleMoves: GameBoardItemMove[] = [];

    for (const idx in moves) {
      if (!idx) {
        continue; // eslint-disable-line no-continue
      }
      const idxMove = { piece: moves[idx], direction: GameDirectionMap[idx] };

      // in the current direction, if no ghost, add to possible moves
      const foundGhost = this.findItem(idx, GameBoardItemType.GHOST);
      if (!foundGhost) {
        possibleMoves.push(idxMove);
      } else if (foundGhost && this.pillTimer?.timer > 0) {
        // if a ghost is found, pursue it
        possibleMoves = [idxMove];
        break;
      }
    }

    if (!possibleMoves.length) {
      return false;
    }

    let move = possibleMoves.pop() as GameBoardItemMove;
    const pos = move.piece.id;
    if (!this.lastPos) {
      // necessary for the init condition
      this.lastPos = pos;
      return move;
    }
    if (pos === this.lastPos) {
      move = moveTo(possibleMoves);
    }
    this.lastPos = move.piece.id;
    return move;
  }

  /**
   * Move Pacman and "eat" the item
   */
  move(piece: GameBoardPiece, direction: GameDirection): void {
    const item = this.items[piece.y][piece.x];
    if (typeof item !== 'undefined') {
      this.score += item.type;
      switch (item.type) {
        case GameBoardItemType.PILL:
          this.pillTimer.timer = pillMax;
          break;
        case GameBoardItemType.GHOST:
          if (typeof item.gotoTimeout !== 'undefined') item.gotoTimeout();
          break;
        default:
          break;
      }
    }
    this.setBackgroundItem({ type: GameBoardItemType.EMPTY });
    this.fillBackgroundItem();

    this.setPiece(piece, direction);
    this.items[piece.y][piece.x] = this;
  }
}

export default Pacman;
