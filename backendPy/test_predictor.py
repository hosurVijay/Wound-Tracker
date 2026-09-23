from predictor import predict_wound


image_path = "../pythonbackendMl/dataset/woundDataset3/1.jpg"


result = predict_wound(image_path)


print("Wound area:", result["woundArea"])
print("Healthy area:", result["healthyArea"])
print("Confidence:", result["confidence"])
print("Mask shape:", result["mask"].shape)