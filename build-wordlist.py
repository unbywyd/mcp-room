"""
Сборка словаря для идентификаторов комнат.

Идентификатор диктуют голосом, поэтому слова отбираются по трём признакам:
длина 3-8 букв, только a-z, и никакой пары, различающейся одной буквой —
такие путают на слух, а ошибка в одном слове делает комнату нечитаемой.
"""

RAW = """
able acid acorn actor adapt admit adobe adopt adult after again agent agree
ahead alarm album alert algae alien align alike alive alley allow alloy almond
alone alpha alter amber amble amend amino among ample amuse anchor angel anger
angle animal ankle annual answer anvil apart apex apple april apron aqua arbor
arcade arch arctic area arena argue armor army aroma array arrow artist ash
aside aspect asset atlas atom attic auburn audio audit august aunt auto avatar
avenue avid avoid awake award aware away axis axle bacon badge bagel baker
balance balcony balloon bamboo banana banjo banner barn barrel basil basin
basket batch bath baton beach beacon beam bean beard beast beaver beech beef
begin behind bell belt bench benefit berry beside beta beyond bicycle binary
bingo birch bird birth biscuit bishop bison bitter black blade blame blanket
blast blaze bleach blend bless blind blink bliss block blood bloom blossom blue
blur blush board boat body boil bolt bond bone bonus book boost border born
borrow bottle bottom bounce bow bowl boy brace brain brake branch brand brass
brave bread break breeze brick bridge brief bright bring brisk broad bronze
brook broom brother brown brush bubble bucket budget buffalo build bulb bulk
bull bundle bunker burden burst bush butter button buyer buzz cabin cable
cactus cage cake calm camel camera camp canal candle candy canoe canvas canyon
cape captain carbon cargo carpet carrot carve cash cask castle catch cause cave
cedar celery cement census center century ceramic chain chair chalk champion
chance change channel chaos chapel chapter charge charm chart chase cheap check
cheese chef cherry chess chest chief child chill chimney chip chisel choice
choose chorus chrome chunk cider cigar cinema circle circus citizen city civic
claim clamp clan clash class claw clay clean clerk clever cliff climb clinic
clip cloak clock clone cloth cloud clover club clump cluster clutch coach coal
coast coat cobalt cobra cocoa coffee coil coin cold collar colony color column
comb comet comfort comic command comment common compact company compare compass
compete concept concert conduct cone confirm connect consider console constant
contact contain content contest context control convert cook copper coral cord
cork corn corner correct cotton couch cough council count county couple courage
course court cousin cover cowboy coyote cozy crab crack cradle craft crane crash
crater crawl crazy cream create credit creek crew cricket crime crisp critic
crop cross crowd crown crucial cruel cruise crumb crush crust crystal cube
cuckoo cucumber cuisine culture curb cure curious curl current curtain curve
cushion custom cycle cypress daily dairy daisy damage damp dance danger dare
dark dash data dawn deal dean debate debris debt decade decide deck declare
decor decrease deep deer defend define degree delay deliver delta demand denim
dense dentist depart depend depth derby desert design desk detail detect device
devote dial diamond diary diesel diet differ digital dignity dilemma dinner
dinosaur direct dirt disagree discover dish dismiss display distance divert
divide divorce dizzy doctor document dolphin domain donate donkey donor door
dose double dove dozen draft dragon drama drape draw dream dress drift drill
drink drive drop drum duck dumb dune during dust duty dwarf dynamic eager eagle
early earn earth ease east easy echo eclipse ecology economy edge edit educate
effort eight elbow elder electric elegant element elephant elevate elite embark
embody embrace emerge emotion employ empower empty enable enact endless endorse
enemy energy enforce engage engine enhance enjoy enlist enough enrich enroll
ensure enter entire entry envelope episode equal equip erase erode error erupt
escape essay essence estate eternal ethics evening event every evidence evil
evoke evolve exact exam example excess exchange excite exclude excuse execute
exercise exhaust exhibit exile exist exit exotic expand expect expert expire
explain expose express extend extra fabric face fact factor fade faint fair
faith false fame family famous fancy fantasy farm fashion fatal father fatigue
fault favor feature federal feed feel fellow female fence fern festival fetch
fever fiber fiction field fifteen fifty fight figure filter final finger finish
fire first fiscal fish fist five flag flame flash flavor flee flesh flight flip
float flock floor flour flow flower fluid flush foam focus fog foil fold folk
follow food foot force forest forget fork form fort forum forward fossil foster
found fox fragile frame free freeze frequent fresh friend fringe frog front
frost frown frozen fruit fuel funny furnace fury future gadget gain galaxy
gallery game garage garden garlic garment gasp gate gather gauge gaze gear gem
gender gene general genius gentle genuine gesture ghost giant gift giggle
giraffe girl glad glance glare glass glide glimpse globe gloom glory glove glow
glue goal goat gold golf goose gorilla gospel gossip govern gown grab grace
grade grain grant grape grass gravel gravity gray great green grid grief grill
grin grip grit grocery group grove guard guess guest guide guilt guitar gulf
gulp habit hair half hall hammer hamster happy harbor harsh harvest hawk hazard
haze health heart heat heavy hedge height hello helmet help herb hero hidden
high hill hint hip hire history hobby hockey hold hole holiday hollow home
honey hood hook hope horn horror horse hospital host hotel hour house hover hub
huge human humble humor hundred hungry hunt hurdle hurry husband hybrid ice
icon idea identify idle ignore image impact impose improve impulse inch include
income increase index indicate indoor industry infant inflict inform inhale
inherit initial inject injury inmate inner innocent input inquiry insane insect
inside inspire install intact intense invest invite involve iron island isolate
issue ivory jacket jaguar jazz jealous jeans jelly jewel join joke journey judge
juice jump jungle junior junk kangaroo keen kernel ketchup kick kidney kind
kingdom kiss kitchen kite kitten kiwi knee knife knock label labor ladder lady
lake lamp language laptop large later latin laugh laundry lava lawn lawsuit
layer lazy leader leaf learn leave lecture legal legend leisure lemon lend
length lens leopard lesson letter level liar liberty library license life lift
light limb limit link lion liquid little live lizard load loan lobster local
lock logic lonely loop lottery loud lounge love loyal lucky luggage lumber lunar
lunch luxury lyrics machine magic magnet maid mail major mammal manage mandate
mango mansion manual maple marble march margin marine market marriage mask mass
master match material matrix matter maximum maze meadow measure meat mechanic
medal media melody melt member memory mention menu mercy merge merit merry mesh
message metal method middle midnight milk million mimic mind minimum minor
minute miracle mirror misery mistake mixture mobile model modify moment monitor
monkey monster month moon moral morning mosquito mother motion motor mountain
mouse movie muffin mule multiply muscle museum mushroom music mutual myself
mystery myth naive napkin narrow nasty nation nature neck negative neglect
neither nephew nerve nest network neutral never news nice night noble noise
nominee noodle normal north nose notable notice novel nuclear number nurse oak
obey object oblige obscure observe obtain obvious occur ocean october odor
offer office often okay olive olympic once onion online opera opinion oppose
option orange orbit orchard order ordinary organ orient original orphan ostrich
outdoor outer output outside oval oven owner oxygen oyster ozone paddle page
palace palm panda panel panic panther paper parade parent park parrot party
patch path patient patrol pattern pause pave payment peace peanut pear peasant
pelican penalty pencil people pepper perfect permit person phone photo phrase
physical piano picnic picture piece pigeon pill pilot pink pioneer pipe pistol
pitch pizza place planet plastic plate play please pledge pluck plug plunge
poem poet point polar pole police pond pony pool popular portion position
possible post potato pottery poverty powder power practice praise predict prefer
prepare present pretty prevent price pride primary print priority prison private
prize problem process produce profit program project promote proof property
prosper protect proud provide public pudding pull pulp pulse pumpkin punch pupil
puppy purchase purity purpose purse push puzzle pyramid quality quantum quarter
question quick quit quiz quote rabbit raccoon race rack radar radio rail rain
raise rally ramp ranch random range rapid rare rate rather raven razor ready
real reason rebel rebuild recall receive recipe record recycle reduce reflect
reform refuse region regret regular reject relax release relief rely remain
remember remind remove render renew rent reopen repair repeat replace report
require rescue resemble resist resource response result retire retreat return
reunion reveal review reward rhythm ribbon rice rich ride ridge rifle right
rigid ring riot ripple risk ritual rival river road roast robot robust rocket
romance roof rookie room rose rotate rough round route royal rubber rude rug
rule runway rural saddle sadness safe sail salad salmon salon salute sample sand
satisfy sauce sausage save scale scan scare scatter scene scheme school science
scissors scorpion scout scrap screen script scrub search season seat second
secret section security seed seek segment select seminar senior sense sentence
series service session settle setup seven shadow shaft shallow share shed shell
sheriff shield shift shine ship shiver shock shoe shoot shop short shoulder
shove shrimp shrug shuffle sibling sick side siege sight sign silent silk silly
silver similar simple since siren sister situate size skate sketch skill skin
skirt skull slab slam sleep slender slice slide slight slim slogan slot slow
slush small smart smile smoke smooth snack snake snap sniff snow soap soccer
social sock soda soft solar soldier solid solution solve someone song soon
sorry sort soul sound soup source south space spare spatial spawn speak special
speed spell spend sphere spice spider spike spin spirit split spoil sponsor
spoon sport spot spray spread spring square squeeze squirrel stable stadium
staff stage stairs stamp stand start state stay steak steel stem step stereo
stick still sting stock stomach stone stool story stove strategy street strike
strong struggle student stuff stumble style subject submit subway success sudden
suffer sugar suggest suit summer sunny sunset super supply supreme surface surge
surprise surround survey suspect sustain swallow swamp swap swarm swear sweet
swift swim swing switch sword symbol symptom syrup system table tackle tail
talent talk tank tape target task taste tattoo taxi teach team tenant tennis
tent term test text thank theme theory thing thought three thrive throw thumb
thunder ticket tide tiger tilt timber tiny tired tissue title toast tobacco
today toddler together toilet token tomato tomorrow tongue tonight tool tooth
topic topple torch tornado tortoise toss total tourist toward tower town toy
track trade traffic tragic train transfer trash travel tray treat tree trend
trial tribe trick trigger trophy trouble truck truly trumpet trust truth tube
tuition tumble tuna tunnel turkey turtle twelve twenty twice twin twist type
typical ugly umbrella unable unaware uncle uncover under undo unfair unfold
unhappy uniform unique unit universe unknown unlock until unusual unveil update
upgrade uphold upper upset urban urge usage useful useless usual utility vacant
vacuum vague valid valley valve vanish vapor various vast vault vehicle velvet
vendor venture venue verb verify version vessel veteran viable vibrant vicious
victory video village vintage violin virtual virus visa visit visual vital vivid
vocal voice volcano volume vote voyage wage wagon wait walk wall walnut want
warfare warm warrior wash wasp waste water wave wealth weapon wear weasel
weather wedding weekend weird welcome west whale wheat wheel whisper wide width
wife wild window wine wing wink winner winter wire wisdom wise wish witness
wolf woman wonder wood wool word work world worry worth wrap wreck wrestle
wrist write wrong yard year yellow young youth zebra zero zone
"""


def one_edit_apart(a: str, b: str) -> bool:
    """Слова, различающиеся одной буквой, — источник ошибок при диктовке."""
    if abs(len(a) - len(b)) > 1:
        return False
    if len(a) == len(b):
        return sum(x != y for x, y in zip(a, b)) == 1
    short, long = (a, b) if len(a) < len(b) else (b, a)
    return any(long[:i] + long[i + 1:] == short for i in range(len(long)))


words = sorted({w for w in RAW.split() if 3 <= len(w) <= 8 and w.isalpha()})
print('после базовой фильтрации:', len(words))

drop = set()
for i, a in enumerate(words):
    if a in drop:
        continue
    for b in words[i + 1:]:
        if len(b) - len(a) > 1:
            break
        if one_edit_apart(a, b):
            drop.add(b)

clean = [w for w in words if w not in drop]
print('после чистки похожих:', len(clean))

# Берём степень двойки: иначе выборка по модулю смещает распределение и
# заявленная стойкость перестаёт быть честной.
size = 1 << (len(clean).bit_length() - 1)
final = clean[:size]
print('итоговый размер:', size, f'({size.bit_length() - 1} бит на слово)')

with open('src/wordlist.ts', 'w', encoding='utf-8') as f:
    f.write('/**\n')
    f.write(' * Словарь для идентификаторов комнат.\n')
    f.write(' *\n')
    f.write(' * Идентификатор диктуют вслух, поэтому слов, различающихся одной буквой,\n')
    f.write(' * здесь нет: ошибка в одной букве делает комнату нечитаемой, а понять это\n')
    f.write(' * можно будет только по пустой истории.\n')
    f.write(' *\n')
    f.write(f' * Ровно {size} слов — степень двойки. Иначе выборка по модулю сместила бы\n')
    f.write(' * распределение, и заявленная стойкость перестала бы быть правдой.\n')
    f.write(' *\n')
    f.write(' * Сгенерирован build-wordlist.py — править руками не нужно.\n')
    f.write(' */\n\n')
    f.write('export const WORDS = [\n')
    for i in range(0, len(final), 8):
        f.write('  ' + ', '.join(f"'{w}'" for w in final[i:i + 8]) + ',\n')
    f.write('] as const\n')

print('записан src/wordlist.ts')
