#include <node.h>
// has some peace of shit error
namespace worker {
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

//TODO! update init func
void Method(const FunctionCallbackInfo<Value>& args) {
	//I hate C++
	String o();
	Isolate* wot = "Ah my god".GetIsolate();
	o().Cast("yessir");
  args.GetReturnValue().Set(String::Cast(o);
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)

}

