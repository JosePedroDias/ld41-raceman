# LD41 - Raceman

A Ludum Dare Jam entry

[Game page on LDJam](https://ldjam.com/events/ludum-dare/41/raceman).

Use the arrow keys to move your car. Pick every dot while avoiding the enemy cars.

----

Play the latest version [HERE](https://josepedrodias.github.io/ld41-raceman/dist-latest/)!

(managed to implement waypoints and make the baddies navigate toward/away from the player based on their vulnerability state. cars now move in the 4 directions instead of car-like movement)

(branch `master` features the latest version but still serves the ld41 deliverables in dist folder to keep serving the original submission in its original URL)

----

Play my LDJAM entry [HERE](https://josepedrodias.github.io/ld41-raceman/dist/)!

(this version has the baddies using the same car movement interface with a vacuum-like dumb navigation process due to time constraints. also the large dots don't make baddies vulnerable)

(the submitted entry code remains in branch `ld41`)

## Concept

Pacman meets racing game.
Based on the pacman level ideas - a maze, a finite set of items to pick to complete the level,
simple navigation for the ghosts, special items to pick up.
The twist - you drive a race car. Ghosts may do too Possibly nitros to pick up...



## TODO

* fix boundaries wrapping
* create artwork:
  * pipes
  * ghosts
  * player car
* artwork work [normal lighting?](http://pixijs.io/examples/#/layers/normals.js)
* audio?


## Lib code credits

* matter [reference](http://brm.io/matter-js/docs/)
* pixi [reference](http://pixijs.download/dev/docs/)


## Tools

* [ezgif sprite cutter](https://ezgif.com/sprite-cutter)


## External artwork

* Comfortaa font [src](https://www.dafont.com/comfortaa.font)

These should not reach release stage but have been using in early devs:

* textures from bandiracer [1](http://www.banditracer.eu/)
* pacman sprites
  [1](https://i.pinimg.com/originals/85/71/e5/8571e53e7056aac79b7c828a8a33c3bd.png)
  [2](http://www.harryguillermo.com/games/pacman/pacman.php)

...they ended up being the final graphics due to time constraints so I opted out of this category :/
