from PIL import Image
import sys

def remove_white_bg(image_path, output_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # White-ish pixels (can adjust threshold if it affects pink/blue)
            # The pink and blue in the logo shouldn't be exactly white
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                # Fully transparent
                newData.append((255, 255, 255, 0))
            else:
                # Keep original color
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    remove_white_bg('logo.png', 'logo_transparent.png')
