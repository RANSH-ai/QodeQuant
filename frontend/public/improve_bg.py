from PIL import Image
import sys

def improve_bg(image_path, output_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        
        datas = img.getdata()
        
        newData = []
        for item in datas:
            r, g, b = item[0], item[1], item[2]
            v = int((r + g + b) / 3)
            diff = max(r, g, b) - min(r, g, b)
            
            # If it is mostly grayscale (black, white, or gray)
            if diff < 30:
                # Calculate alpha: white (255) -> alpha 0, black (0) -> alpha 255
                # We can adjust the curve if needed, but linear is a good start
                alpha = 255 - v
                
                # To prevent making dark grays too transparent, we might adjust
                # But since the border is black, this makes perfect anti-aliased black
                newData.append((0, 0, 0, alpha))
            else:
                # Colored pixels (pink, blue)
                # Keep them opaque
                newData.append((r, g, b, 255))
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Original image is logo.png
    improve_bg('logo.png', 'logo_transparent2.png')
