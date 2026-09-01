from PIL import Image

# 6. ELIARQ
img6 = Image.open('C:/Users/USER/.gemini/antigravity/brain/b3ae98e5-d30c-4e55-a12f-9b586b441716/.user_uploaded/media_1788289386603.png').convert('RGBA')
data = []
for p in img6.getdata():
    # Background is off-white (R>230, G>230, B>230)
    if p[0] > 230 and p[1] > 230 and p[2] > 230:
        data.append((255, 255, 255, 0))
    else:
        # Text/Logo is red and black, turn to white
        data.append((255, 255, 255, p[3]))
img6.putdata(data)
img6.save('public/sponsors/eliarq.png', 'PNG')
