from PIL import Image

# 1. FITTOWN
img1 = Image.open('C:/Users/USER/.gemini/antigravity/brain/b3ae98e5-d30c-4e55-a12f-9b586b441716/.user_uploaded/media_1788289306491.png').convert('RGBA')
data = []
for p in img1.getdata():
    # Green background: G > 200, R < 100, B < 100
    if p[1] > 200 and p[0] < 150 and p[2] < 150:
        data.append((255, 255, 255, 0))
    else:
        # Non-background -> White
        data.append((255, 255, 255, int(p[3]*0.9) if p[3] > 0 else 255))
img1.putdata(data)
img1.save('public/sponsors/fittown.png', 'PNG')

# 2. LA PARRILLA
img2 = Image.open('C:/Users/USER/.gemini/antigravity/brain/b3ae98e5-d30c-4e55-a12f-9b586b441716/.user_uploaded/media_1788289313844.png').convert('RGBA')
data = []
for p in img2.getdata():
    # Black background: R,G,B < 30
    if p[0] < 50 and p[1] < 50 and p[2] < 50:
        data.append((255, 255, 255, 0))
    else:
        data.append((255, 255, 255, p[3]))
img2.putdata(data)
img2.save('public/sponsors/parrilla.png', 'PNG')

# 3. GRAFICOK
img3 = Image.open('C:/Users/USER/.gemini/antigravity/brain/b3ae98e5-d30c-4e55-a12f-9b586b441716/.user_uploaded/media_1788289316908.png').convert('RGBA')
data = []
for p in img3.getdata():
    # White background
    if p[0] > 230 and p[1] > 230 and p[2] > 230:
        data.append((255, 255, 255, 0))
    else:
        data.append((255, 255, 255, p[3]))
img3.putdata(data)
img3.save('public/sponsors/graficok.png', 'PNG')

# 4. AGROLVERA
img4 = Image.open('C:/Users/USER/.gemini/antigravity/brain/b3ae98e5-d30c-4e55-a12f-9b586b441716/.user_uploaded/media_1788289321957.jpg').convert('RGBA')
data = []
for p in img4.getdata():
    # Dark green logo: R < 90, G between 50 and 120, B < 90
    if p[0] < 100 and p[1] < 120 and p[2] < 100 and p[1] > p[0] and p[1] > p[2]:
        data.append((255, 255, 255, 255))
    else:
        data.append((255, 255, 255, 0))
img4.putdata(data)
img4.save('public/sponsors/agrolvera.png', 'PNG')

# 5. DORISI
img5 = Image.open('C:/Users/USER/.gemini/antigravity/brain/b3ae98e5-d30c-4e55-a12f-9b586b441716/.user_uploaded/media_1788289324317.png').convert('RGBA')
data = []
for p in img5.getdata():
    if p[0] > 220 and p[1] > 220 and p[2] > 220:
        data.append((255, 255, 255, 0))
    elif p[3] < 10:
        data.append((255, 255, 255, 0))
    else:
        data.append((255, 255, 255, p[3]))
img5.putdata(data)
img5.save('public/sponsors/dorisi.png', 'PNG')
