from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
size=1024
im=Image.new('RGBA',(size,size),(0,0,0,0));d=ImageDraw.Draw(im)
d.rounded_rectangle((72,72,952,952),radius=210,fill='#173b4b')
d.rounded_rectangle((110,110,914,914),radius=175,fill='#1b6673')
# Libro abierto y techo escolar, reconocibles incluso en tamaño pequeño.
d.polygon([(220,410),(512,245),(804,410),(748,448),(512,320),(276,448)],fill='#f2b84b')
d.rounded_rectangle((235,444,500,755),radius=32,fill='#ffffff')
d.rounded_rectangle((524,444,789,755),radius=32,fill='#ffffff')
d.polygon([(500,475),(512,455),(524,475),(524,770),(512,790),(500,770)],fill='#dbe8ec')
d.line((285,530,450,530),fill='#9bb5bd',width=18);d.line((285,590,450,590),fill='#9bb5bd',width=18)
d.line((574,530,739,530),fill='#9bb5bd',width=18);d.line((574,590,739,590),fill='#9bb5bd',width=18)
im.save(out)
