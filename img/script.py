import os
from PIL import Image, UnidentifiedImageError

def convert_images_to_jpg_and_list():
    # Get the current folder path
    current_folder = os.getcwd()

    # List all files in the current folder
    filenames = os.listdir(current_folder)

    # Initialize an empty list to store the converted filenames
    converted_filenames = []

    # Loop through each file
    for file in filenames:
        # Check if the file is an image (e.g., .png, .jpeg, .bmp, .tiff, .gif, etc.)
        if file.lower().endswith((".png", ".jpeg", ".bmp", ".tiff", ".tif", ".gif")):
            try:
                # Open the image file
                img = Image.open(os.path.join(current_folder, file))
                # Convert the image to RGB mode (if not already)
                img = img.convert("RGB")

                # Create a new filename with .jpg extension
                new_filename = os.path.splitext(file)[0] + ".jpg"
                new_filepath = os.path.join(current_folder, new_filename)

                # Save the image as .jpg
                img.save(new_filepath, "JPEG")

                # Append the new filename to the list
                converted_filenames.append(new_filename)
            except UnidentifiedImageError:
                print(f"Skipping file {file}: not a recognizable image format.")
            except Exception as e:
                print(f"Error converting {file}: {e}")

    # Return the list of all filenames (including non-image files)
    all_filenames = os.listdir(current_folder)
    return all_filenames

if __name__ == "__main__":
    # Call the function and print the results
    all_files = convert_images_to_jpg_and_list()
    print("Files in the current folder:")
    for file in all_files:
        print(file)
